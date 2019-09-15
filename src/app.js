const express = require("express");
require("./settings/mongoose")();

const app = express();

app.use(express.json());

app.use("/api/users", require("./routes/users"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/confirmation", require("./routes/confirmation"));
app.use("/api/tasks", require("./routes/tasks"));

module.exports = app;
