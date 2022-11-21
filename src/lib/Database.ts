// https://github.com/duckdb-wasm-examples/svelte-typescript/blob/master/src/main.ts
// https://github.com/duckdb-wasm-examples/sveltekit-typescript/blob/main/src/routes/index.svelte
// https://observablehq.com/@cmudig/duckdb

import * as duckdb from '@duckdb/duckdb-wasm';
import duckdb_wasm from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm';
import duckdb_wasm_eh from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm';
import duckdb_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js';
import duckdb_worker_eh from '@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js';

export { init, query };

const DUCKDB_BUNDLES: duckdb.DuckDBBundles = {
	mvp: {
		mainModule: duckdb_wasm,
		mainWorker: duckdb_worker,
	},
	eh: {
		mainModule: duckdb_wasm_eh,
		mainWorker: duckdb_worker_eh,
	},
};

let db: duckdb.AsyncDuckDB;
let conn: duckdb.AsyncDuckDBConnection;

async function init(name: string, text: string) {
	const bundle = await duckdb.selectBundle(DUCKDB_BUNDLES);
	const logger = new duckdb.ConsoleLogger();
	const worker = new Worker(bundle.mainWorker);

	db = new duckdb.AsyncDuckDB(logger, worker);

  await db.instantiate(bundle.mainModule);

  db.registerFileText(name, text);

  conn = await db.connect();

  conn.insertCSVFromPath(name, {
    schema: 'main',
    name
  });

  return db;
};

async function query(query: string) {
  const result = await conn.query(query);
  return result;
}