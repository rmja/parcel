// @flow
import {TSModule} from './TSModule';
import type {TSModuleGraph} from './TSModuleGraph';

import ts from 'typescript';
import nullthrows from 'nullthrows';
import {getExportedName, isDeclaration, createImportSpecifier} from './utils';

export function shake(
  moduleGraph: TSModuleGraph,
  context: any,
  sourceFile: any,
): any {
  // We traverse things out of order which messes with typescript's internal state.
  // We don't rely on the lexical environment, so just overwrite with noops to avoid errors.
  context.suspendLexicalEnvironment = () => {};
  context.resumeLexicalEnvironment = () => {};

  // Propagate exports from the main module to determine what types should be included
  let exportedNames = moduleGraph.propagate(context);

  // When module definitions are nested inside each other (e.g with module augmentation),
  // we want to keep track of the hierarchy so we can associated nodes with the right module.
  const moduleStack: Array<?TSModule> = [];

  let addedGeneratedImports = false;

  let _currentModule: ?TSModule;
  let visit = (node: any): any => {
    if (ts.isBundle(node)) {
      return ts.updateBundle(node, ts.visitNodes(node.sourceFiles, visit));
    }

    // Flatten all module declarations into the top-level scope
    if (ts.isModuleDeclaration(node)) {
      // Deeply nested module declarations are assumed to be module augmentations and left alone.
      if (moduleStack.length >= 1) {
        if (node.modifiers) {
          // Since we are hoisting them to the top-level scope, we need to add a "declare" keyword to make them ambient.
          // we also want the declare keyword to come after the export keyword to guarantee a valid typings file.
          const index =
            node.modifiers.length &&
            node.modifiers[0].kind === ts.SyntaxKind.ExportKeyword
              ? 1
              : 0;
          node.modifiers.splice(
            index,
            0,
            ts.createModifier(ts.SyntaxKind.DeclareKeyword),
          );
        }
        return node;
      }

      moduleStack.push(_currentModule);
      let isFirstModule = !_currentModule;
      const nodeModule = moduleGraph.getModule(node.name.text);
      _currentModule = nodeModule;
      let statements = ts.visitEachChild(node, visit, context).body.statements;
      _currentModule = moduleStack.pop();

      if (isFirstModule && !addedGeneratedImports) {
        statements.unshift(...generateImports(moduleGraph));
        addedGeneratedImports = true;
      }

      const exportedName = nodeModule.names.get('*');
      if (exportedName) {
        node = ts.getMutableClone(node);
        node.name = ts.createIdentifier(exportedName);
        node.modifiers.unshift(ts.createModifier(ts.SyntaxKind.ExportKeyword));
        statements.push(node);
      }
      return statements;
    }

    if (!_currentModule) {
      return ts.visitEachChild(node, visit, context);
    }

    // Remove inline imports. They are hoisted to the top of the output.
    if (ts.isImportDeclaration(node)) {
      return null;
    }

    let currentModule = nullthrows(_currentModule);
    // Remove exports from flattened modules
    if (ts.isExportDeclaration(node)) {
      if (
        !node.moduleSpecifier ||
        moduleGraph.getModule(node.moduleSpecifier.text)
      ) {
        if (!node.moduleSpecifier && node.exportClause) {
          // Filter exported elements to only external re-exports
          let exported = [];
          for (let element of node.exportClause.elements) {
            let name = (element.propertyName ?? element.name).text;
            if (
              exportedNames.get(name) === currentModule &&
              !currentModule.hasBinding(name)
            ) {
              exported.push(element);
            }
          }

          if (exported.length > 0) {
            return ts.updateExportDeclaration(
              node,
              undefined, // decorators
              undefined, // modifiers
              ts.updateNamedExports(node.exportClause, exported),
              undefined, // moduleSpecifier
            );
          }
        }

        return null;
      }
    }

    // Remove export assignment if unused.
    if (ts.isExportAssignment(node)) {
      let name = currentModule.getName('default');
      if (exportedNames.get(name) !== currentModule) {
        return null;
      }
    }

    if (isDeclaration(ts, node)) {
      let name = getExportedName(ts, node) || node.name.text;

      // Remove unused declarations
      if (!currentModule.used.has(name)) {
        return null;
      }

      // Remove original export modifiers
      node = ts.getMutableClone(node);
      node.modifiers = (node.modifiers || []).filter(
        m =>
          m.kind !== ts.SyntaxKind.ExportKeyword &&
          m.kind !== ts.SyntaxKind.DefaultKeyword,
      );

      // Rename declarations
      let newName = currentModule.getName(name);
      if (newName !== name && newName !== 'default') {
        node.name = ts.createIdentifier(newName);
      }

      // Export declarations that should be exported
      if (exportedNames.get(newName) === currentModule) {
        if (newName === 'default') {
          node.modifiers.unshift(
            ts.createModifier(ts.SyntaxKind.DefaultKeyword),
          );
        }

        node.modifiers.unshift(ts.createModifier(ts.SyntaxKind.ExportKeyword));
      } else if (
        ts.isFunctionDeclaration(node) ||
        ts.isClassDeclaration(node)
      ) {
        node.modifiers.unshift(ts.createModifier(ts.SyntaxKind.DeclareKeyword));
      }
    }

    if (ts.isVariableStatement(node)) {
      node = ts.visitEachChild(node, visit, context);

      // Remove empty variable statements
      if (node.declarationList.declarations.length === 0) {
        return null;
      }

      // Remove original export modifiers
      node.modifiers = (node.modifiers || []).filter(
        m =>
          m.kind !== ts.SyntaxKind.ExportKeyword &&
          m.kind !== ts.SyntaxKind.DeclareKeyword,
      );

      // Add export modifier if all declarations are exported.
      let isExported = node.declarationList.declarations.every(
        d => exportedNames.get(d.name.text) === currentModule,
      );
      if (isExported) {
        node.modifiers.unshift(ts.createModifier(ts.SyntaxKind.ExportKeyword));
      } else {
        // Otherwise, add `declare` modifier (required for top-level declarations in d.ts files).
        node.modifiers.unshift(ts.createModifier(ts.SyntaxKind.DeclareKeyword));
      }

      return node;
    }

    if (ts.isVariableDeclaration(node)) {
      // Remove unused variables
      if (!currentModule.used.has(node.name.text)) {
        return null;
      }
    }

    // Rename references
    if (ts.isIdentifier(node) && currentModule.names.has(node.text)) {
      let newName = nullthrows(currentModule.getName(node.text));
      if (newName !== 'default') {
        return ts.createIdentifier(newName);
      }
    }

    // Replace namespace references with final names
    if (ts.isQualifiedName(node) && ts.isIdentifier(node.left)) {
      let resolved = moduleGraph.resolveImport(
        currentModule,
        node.left.text,
        node.right.text,
      );
      if (resolved && resolved.module.hasBinding(resolved.name)) {
        return ts.createIdentifier(resolved.name);
      } else {
        return ts.updateQualifiedName(
          node,
          ts.createIdentifier(currentModule.getName(node.left.text)),
          node.right,
        );
      }
    }

    // Remove private properties
    if (ts.isPropertyDeclaration(node)) {
      let isPrivate =
        node.modifiers &&
        node.modifiers.some(m => m.kind === ts.SyntaxKind.PrivateKeyword);
      if (isPrivate) {
        return null;
      }
    }

    return ts.visitEachChild(node, visit, context);
  };

  return ts.visitNode(sourceFile, visit);
}

function generateImports(moduleGraph: TSModuleGraph) {
  let importStatements = [];
  for (let [specifier, names] of moduleGraph.getAllImports()) {
    let defaultSpecifier;
    let namespaceSpecifier;
    let namedSpecifiers = [];
    for (let [name, imported] of names) {
      if (imported === 'default') {
        defaultSpecifier = ts.createIdentifier(name);
      } else if (imported === '*') {
        namespaceSpecifier = ts.createNamespaceImport(
          ts.createIdentifier(name),
        );
      } else {
        namedSpecifiers.push(
          createImportSpecifier(
            ts,
            name === imported ? undefined : ts.createIdentifier(imported),
            ts.createIdentifier(name),
          ),
        );
      }
    }

    if (namespaceSpecifier) {
      let importClause = ts.createImportClause(
        defaultSpecifier,
        namespaceSpecifier,
      );
      importStatements.push(
        ts.createImportDeclaration(
          undefined,
          undefined,
          importClause,
          // $FlowFixMe
          ts.createLiteral(specifier),
        ),
      );
      defaultSpecifier = undefined;
    }

    if (defaultSpecifier || namedSpecifiers.length > 0) {
      let importClause = ts.createImportClause(
        defaultSpecifier,
        namedSpecifiers.length > 0
          ? ts.createNamedImports(namedSpecifiers)
          : undefined,
      );
      importStatements.push(
        ts.createImportDeclaration(
          undefined,
          undefined,
          importClause,
          // $FlowFixMe
          ts.createLiteral(specifier),
        ),
      );
    }
  }

  return importStatements;
}
