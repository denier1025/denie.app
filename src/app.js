const express = require("express");
require("./settings/db")();

const app = express();
const PORT = process.env.PORT;

app.use(express.json());

app.use("/api/users", require("./routes/users"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/confirmation", require("./routes/confirmation"));
app.use("/api/tasks", require("./routes/tasks"));

app.listen(PORT, () => {
  console.log(`Server up and running on port ${PORT}.`);
});
