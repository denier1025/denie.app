const mongoose = require("mongoose");
const sendingErrors = require("../routes/sharedParts/sendingErrors");

module.exports = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false
    });
    console.log("MongoDB is connected!");
  } catch (err) {
    sendingErrors(err);

    process.exit(1);
  }
};
