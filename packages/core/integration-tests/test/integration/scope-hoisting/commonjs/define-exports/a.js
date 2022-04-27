export const foo = 'bar'

export function getExports() {
    return exports
}

globalThis.output = getExports() === exports && getExports().foo
