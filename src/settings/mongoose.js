const config = require("config")
const debug = require("./debug")
const mongoose = require("mongoose");
const sendAnError = require("../utils/sendingEmails/error");

module.exports = async () => {
  try {
    await mongoose.connect(config.get("mongo_uri"), {
      dbName: "DENIE_DB",
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true
    });
    debug("MongoDB is connected!");
  } catch (err) {
    sendAnError(err);

    process.exit(1);
  }
};
