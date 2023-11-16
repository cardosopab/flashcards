import { Database } from "bun:sqlite";
import Card from "./Card";

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
async function readFlashcards(): Promise<Card[]> {
  const queryResult = db.query(`SELECT * FROM flashcards`).all();

  // Explicitly cast the query result to Card[]
  return queryResult as Card[];
}

// Function to update a flashcard
function updateFlashcard(
  cardId: number,
  newQuestion: string,
  newAnswer: string
) {
  db.run("UPDATE flashcards SET question=?, answer=? WHERE id=?", [
    newQuestion,
    newAnswer,
    cardId,
  ]);
}

// Function to delete a flashcard
function deleteFlashcard(cardId: number) {
  db.run("DELETE FROM flashcards WHERE id=?", [cardId]);
}

export { createFlashcard, readFlashcards, updateFlashcard, deleteFlashcard };
