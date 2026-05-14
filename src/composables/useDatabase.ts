import Database from '@tauri-apps/plugin-sql'

let db: Database | null = null

const INIT_SQL = `
CREATE TABLE IF NOT EXISTS food_items (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  title      TEXT NOT NULL,
  emoji      TEXT NOT NULL DEFAULT '🍜',
  description TEXT DEFAULT '',
  distance   TEXT DEFAULT '',
  weight     INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
`

export async function useDatabase() {
  if (!db) {
    db = await Database.load('sqlite:sileat.db')
    await db.execute(INIT_SQL)
  }
  return db
}
