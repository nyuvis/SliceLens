// https://github.com/darionco/rollup-typescript-webworkers
declare module 'web-worker:*' {
  const WorkerFactory: new () => Worker;
  export default WorkerFactory;
}