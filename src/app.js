require("./settings/mongoose")();

const express = require("express");
const app = express();

app.use(express.json());

app.use("/api/users", require("./routes/users"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/confirmation", require("./routes/confirmation"));
app.use("/api/tasks", require("./routes/tasks"));

if (process.env.NODE_ENV === "production") {
  const path = require("path");

  app.use(express.static(path.resolve("client", "build")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve("../", "client", "build", "index.html"));
  });
}

module.exports = app;
