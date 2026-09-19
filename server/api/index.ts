import app from "../src/app";

app.get("/", (_req, res) => {
  res.json({
    message: "Vercel function is running",
  });
});

app.get("/api/v1/health", (_req, res) => {
  res.json({
    success: true,
    message: "Health route reached",
  });
});

export default app;