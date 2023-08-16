const express = require('express');
const app = express();
const morgan = require("morgan")

// Configuration via env variables
const PORT = process.env.PORT || 8080

// Logging
app.use(
    morgan(
      ":remote-addr - :remote-user [:date[clf]] ':method :url HTTP/:http-version' :status :res[content-length]"
    )
  );

// Parse request body as JSON
app.use(express.json())

// Routes
app.use("/api/v1", require("./routes/api/v1"));

// Health check endpoints
app.get("/healthz", (req, res) => {
  res.sendStatus(200);
})

const server = app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
    console.info("SIGTERM signal received. Closing server!");
    server.close();
  });
  
  // Uncaught errors
  process.on("uncaughtException", (err) => {
    console.error("There was an uncaught error", err);
    server.close();
    process.exit(1);
  });