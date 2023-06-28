const express = require('express');
const app = express();
const morgan = required("morgan")

// Configuration via env variables
const ROLE = process.env.ROLE || "DEFAULT"
const PORT = process.env.PORT || 8080

// Logging
app.use(
    morgan(
      ":remote-addr - :remote-user [:date[clf]] ':method :url HTTP/:http-version' :status :res[content-length]"
    )
  );

app.get('/', (req, res) => {
  res.send(`Hello my role is: ${ROLE}`);
});

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