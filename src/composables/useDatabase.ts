import Database from '@tauri-apps/plugin-sql'

let db: Database | null = null
let dbPromise: Promise<Database> | null = null

const INIT_SQL = `
CREATE TABLE IF NOT EXISTS food_items (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  title      TEXT NOT NULL,
  emoji      TEXT NOT NULL DEFAULT '🍜',
  description TEXT DEFAULT '',
  distance   TEXT DEFAULT '',
  weight     INTEGER NOT NULL DEFAULT 1,
  skip_today INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
`

const MIGRATE_SQL = `
ALTER TABLE food_items ADD COLUMN skip_today INTEGER NOT NULL DEFAULT 0;
`

export async function useDatabase() {
  if (!db) {
    dbPromise ??= (async () => {
      const database = await Database.load('sqlite:sileat.db')
      await database.execute(INIT_SQL)
      try {
        await database.execute(MIGRATE_SQL)
      } catch {
        // column already exists
      }
      db = database
      return database
    })()

    try {
      db = await dbPromise
    } catch (error) {
      dbPromise = null
      throw error
    }
  }
  return db
}
