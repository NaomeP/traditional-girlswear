import app from "./app.js";

const PORT = Number(process.env.PORT) || 5000;

console.log("Starting server...");
console.log("PORT =", PORT);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});