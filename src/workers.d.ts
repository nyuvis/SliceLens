// https://github.com/darionco/rollup-typescript-webworkers
declare module 'web-worker:*' {
  const WorkerFactory: new () => Worker;
  export default WorkerFactory;
}

// https://github.com/duckdb-wasm-examples/svelte-typescript/blob/master/src/global.d.ts

declare module '*.wasm' {
  const value: any;
  export default value;
}

declare module '*.worker.js' {
  const value: any;
  export default value;
}