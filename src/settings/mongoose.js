const mongoose = require("mongoose");
const sendAnError = require("../utils/sendingEmails/error");

module.exports = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "DENIE_DB",
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true
    });
    console.log("MongoDB is connected!");
  } catch (err) {
    sendAnError(err);

    process.exit(1);
  }
};
