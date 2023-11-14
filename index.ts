Bun.serve({
  fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === "/") return new Response(Bun.file("./index.html"));
    if (url.pathname === "/card") return new Response("Card!");
    return new Response("404!");
  },
  port: 8080,
});
