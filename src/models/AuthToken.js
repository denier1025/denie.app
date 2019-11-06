const { Schema, model } = require("mongoose");
const { refreshTokenExp } = require("../settings/global");

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
  refreshToken: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: refreshTokenExp
  }
});

module.exports = model("AuthToken", AuthTokenSchema);
