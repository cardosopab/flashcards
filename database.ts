import { Database } from "bun:sqlite";
const db = new Database("cards.sqlite", { create: true });

// Create a table to store flashcards if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS flashcards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question TEXT,
    answer TEXT
  )
`);

// Function to create a new flashcard
function createFlashcard(question: string, answer: string) {
  const insert = db.prepare(
    "INSERT INTO flashcards (question, answer) VALUES ($question, $answer)"
  );
  insert.run({ $question: question, $answer: answer });
}

// Function to retrieve all flashcards
async function readFlashcards() {
  console.log("readFlashcards");
  return db.query(`SELECT * FROM flashcards`).all();
}

// Function to update a flashcard
// function updateFlashcard(
//   cardId: number,
//   newQuestion: string,
//   newAnswer: string
// ) {
//   db.run("UPDATE flashcards SET question=?, answer=? WHERE id=?", [
//     newQuestion,
//     newAnswer,
//     cardId,
//   ]);
// }

// Function to delete a flashcard
function deleteFlashcard(cardId: number) {
  db.run("DELETE FROM flashcards WHERE id=?", [cardId]);
}

export { createFlashcard, readFlashcards, deleteFlashcard };
