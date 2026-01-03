import { createApp } from 'json-server/lib/app.js';
import { Observer } from 'json-server/lib/observer.js';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';
const dbFile = path.join(__dirname, 'db.json');

// Ensure db.json exists and is valid
if (!existsSync(dbFile)) {
  writeFileSync(dbFile, '{}');
} else if (readFileSync(dbFile, 'utf-8').trim() === '') {
  writeFileSync(dbFile, '{}');
}

// Set up database adapter
const adapter = new JSONFile(dbFile);
const observer = new Observer(adapter);
const db = new Low(observer, {});

// Read database
await db.read();

// Initialize with default collections if empty
if (!db.data || Object.keys(db.data).length === 0) {
  db.data = {
    restaurants: [],
    menu: [],
    orders: [],
    users: []
  };
  await db.write();
}

// Create app
const app = createApp(db, { static: [] });

// Start server
app.listen(PORT, () => {
  console.log(`JSON Server is running on http://${HOST}:${PORT}`);
  console.log(`API endpoints available:`);
  if (Object.keys(db.data).length > 0) {
    Object.keys(db.data).forEach((key) => {
      console.log(`  - http://${HOST}:${PORT}/${key}`);
    });
  } else {
    console.log(`  No endpoints found. Add data to db.json`);
  }
});