import Card from "./Card";
import {
  createFlashcard,
  deleteFlashcard,
  getFlashcardByIndex,
  getFlashcardsCount,
  readFlashcards,
  updateFlashcard,
} from "./database";
let rowIndex: number | null = null;
let isQuestion = true;
let flashcard: Card = {} as Card;
Bun.serve({
  async fetch(req: Request) {
    const url = new URL(req.url);

    if (url.pathname === "/") return new Response(Bun.file("./index.html"));

    // Handle GET request to "/cards" endpoint
    if (url.pathname === "/cards" && req.method === "GET") {
      try {
        const flashcards = await readFlashcards();
        const jsonResponse = new Response(JSON.stringify({ flashcards }), {
          headers: { "Content-Type": "application/json" },
        });

        return jsonResponse;
      } catch (error) {
        console.error("Error fetching flashcards:", error);

        // Return an error response
        return new Response("Internal Server Error", { status: 500 });
      }
    }

    // Handle POST request to "/cards" endpoint
    if (url.pathname === "/cards" && req.method === "POST") {
      const params = url.searchParams;

      // Extract flashcard information
      const question = params.get("question");
      const answer = params.get("answer");
      // Create a new flashcard
      if (question && answer) {
        createFlashcard(question, answer);
      }

      return new Response(`${question},  ${answer}, created!`);
    }

    // Handle PUT request to "/cards" endpoint
    if (url.pathname === "/cards" && req.method === "PUT") {
      const params = url.searchParams;

      // Extract flashcard information
      const cardId = params.get("cardId");
      const question = params.get("question");
      const answer = params.get("answer");
      // Create a new flashcard
      if (question && answer && cardId) {
        updateFlashcard(parseInt(cardId), question, answer);
      }

      return new Response(`${question}, ${answer} created!`);
    }

    // Handle POST request to "/cards" endpoint
    if (url.pathname === "/cards" && req.method === "DELETE") {
      const params = url.searchParams;
      const isCardId = params.has("cardId");

      // Extract flashcard information
      const cardId = params.get("cardId");
      // Create a new flashcard
      if (cardId) {
        deleteFlashcard(parseInt(cardId));
      }

      return new Response(`${cardId}, ${isCardId} deleted!`);
    }

    if (url.pathname === "/newCard" && req.method === "POST") {
      const flashcardsCount = await getFlashcardsCount();
      // const rowIndex = Math.floor(Math.random() * flashcardsCount);
      rowIndex = rowIndex == null ? 0 : ++rowIndex % flashcardsCount;

      flashcard = (await getFlashcardByIndex(rowIndex)) ?? ({} as Card);
      if (flashcard.id) {
        isQuestion = true;
        return new Response(`${FlashCard(flashcard.question)}`);
      } else {
        return new Response(`${FlashCard("No flashcard found!")}`);
      }
    }

    if (url.pathname === "/flip" && req.method === "POST") {
      isQuestion = !isQuestion;

      if (flashcard.id) {
        let reply = isQuestion
          ? `${FlashCard(flashcard.question)}`
          : `${FlashCard(flashcard.answer)}`;
        return new Response(reply);
      } else {
        return new Response(`${FlashCard("No flashcard found!")}`);
      }
    }

    if (url.pathname === "/addForm" && req.method === "POST") {
      return new Response(AddForm());
    }

    if (url.pathname === "/submitCard" && req.method === "POST") {
      try {
        const formData = await req.formData(); // Parse form data

        // Get values from the form fields
        const question = formData.get("question") as string;
        const answer = formData.get("answer") as string;

        // Check if both question and answer exist
        if (question && answer) {
          // Create flashcard using the form input values
          const flashcardId = createFlashcard(question, answer);

          // Construct a response or perform additional actions if needed
          let reply = `Flashcard created with ID: ${flashcardId}`;
          return new Response(`${FlashCard(reply)}`);
        } else {
          // Handle the case when question or answer is missing
          return new Response(
            `${AddForm("Please provide both a question and a answer.")}`
          );
        }
      } catch (error) {
        console.error("Error processing form data:", error);
        return new Response("Internal Server Error", { status: 500 });
      }
    }

    return new Response("404!");
  },
  port: 3000,
});

const FlashCard = (text: string) => {
  return `
  <button hx-post="/addForm" hx-swap="innerHTML" hx-target="#content-container" class="button">Add Card</button>
  <div class="card">${text}</div>
  <button hx-post="/newCard" hx-swap="innerHTML" hx-target="#content-container" class="button">Next Card</button>
  <button hx-post="/flip" hx-swap="innerHTML" hx-target="#content-container" class="button">Flip</button>
  `;
};

const AddForm = (error: string = "Please enter a question, and answer!") => {
  return `
<form hx-post="/submitCard">
  <p>${error}</p>
  <input id="question" name="question" type="text"
      hx-post="/validate"
      hx-trigger="change"
      hx-sync="closest form:abort"
  >
  <input id="answer" name="answer" type="text"
      hx-post="/validate"
      hx-trigger="change"
      hx-sync="closest form:abort"
  >
  <button type="submit">Submit</button>
</form>
<button hx-post="/newCard" hx-swap="innerHTML" hx-target="#content-container" class="button">Next Card</button>
  `;
};
