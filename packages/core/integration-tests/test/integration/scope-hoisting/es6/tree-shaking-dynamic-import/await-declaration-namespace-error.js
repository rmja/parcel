globalThis.output = (async () => {
  let ns = await import("./async.js");
  return ns.missing;
})();
