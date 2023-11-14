import { createFlashcard, deleteFlashcard, readFlashcards } from "./database";
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

    // Handle POST request to "/create" endpoint
    if (url.pathname === "/create" && req.method === "POST") {
      const params = url.searchParams;
      const isQuestion = params.has("question");
      const isAnswer = params.has("answer");

      // Extract flashcard information
      const question = params.get("question");
      const answer = params.get("answer");
      // Create a new flashcard
      if (question && answer) {
        createFlashcard(question, answer);
      }

      return new Response(
        `${question}, ${isQuestion}, ${answer}, ${isAnswer} created!`
      );
    }

    // Handle POST request to "/create" endpoint
    if (url.pathname === "/delete" && req.method === "DELETE") {
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
    return new Response("404!");
  },
  port: 3000,
});
