const sqlite3 = require('better-sqlite3');
const db = new sqlite3('./focalboard.db');

console.log("=== Current Board Icons ===");
const boards = db.prepare("SELECT title, icon FROM boards WHERE id = 'bkb8aixg6m3dr8jwd5w1u8et8gc'").get();
console.log(`${boards.title}: "${boards.icon}"`);

console.log("\n=== Current Card Icons (from Project Tasks) ===");
const cards = db.prepare(`
  SELECT title, fields 
  FROM blocks 
  WHERE type='card' AND board_id='bkb8aixg6m3dr8jwd5w1u8et8gc'
  LIMIT 10
`).all();

cards.forEach(card => {
  const fields = JSON.parse(card.fields || '{}');
  if (fields.icon) {
    console.log(`  "${card.title}": "${fields.icon}"`);
  }
});

db.close();
