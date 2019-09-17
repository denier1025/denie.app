const { Schema, model } = require("mongoose");
const { ECTExpiresIn } = require("../settings/global");

const EmailConfirmationTokenSchema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },
  token: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: ECTExpiresIn
  }
});

module.exports = model("EmailConfirmationToken", EmailConfirmationTokenSchema);
