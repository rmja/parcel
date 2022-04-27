import foo from './wrapped'
import bar from './notwrapped'

function calc() {
  return foo() + bar();
}

globalThis.output = calc() + ':' + foo() + ':' + bar();
