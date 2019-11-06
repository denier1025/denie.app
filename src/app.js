require("./settings/mongoose")();
const debug = require("./settings/debug");

const express = require("express");
const app = express();
const helmet = require("helmet");
const morgan = require("morgan");

app.use(helmet());
app.use(express.json());

if (app.get("env") === "development") {
  app.use(morgan("dev"));
  debug("Morgan enabled...");
}

app.use(require("./api/index"));

if (app.get("env") === "production") {
  const path = require("path");

  app.use(express.static(path.resolve("client", "build")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve("../", "client", "build", "index.html"));
  });
}

module.exports = app;
