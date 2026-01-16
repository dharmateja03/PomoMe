import { neon, NeonQueryFunction } from '@neondatabase/serverless';
import { drizzle, NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from './schema';

type DbType = NeonHttpDatabase<typeof schema> & {
  $client: NeonQueryFunction<false, false>;
};

function createDb(): DbType {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  const sql = neon(process.env.DATABASE_URL);
  return drizzle(sql, { schema });
}

// Lazy initialization - only creates db when actually used
let _db: DbType | undefined;

export const db = new Proxy({} as DbType, {
  get(_target, prop) {
    if (!_db) {
      _db = createDb();
    }
    return (_db as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export * from './schema';
