const { Schema, model } = require("mongoose");
const { expiresIn } = require("../settings/global");

const AuthTokenSchema = new Schema({
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
    expires: expiresIn
  }
});

module.exports = model("AuthToken", AuthTokenSchema);
