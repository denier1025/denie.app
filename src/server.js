const config = require("config");
const debug = require("./settings/debug");
const app = require("./app");

const PORT = config.get("port");

app.listen(PORT, () => {
  debug(`Server up and running on port ${PORT}.`);
});
