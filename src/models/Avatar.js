const { Schema, model } = require("mongoose");
const { avatarSize } = require("../settings/global");

const AvatarSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User"
    },
    data: {
      type: Buffer,
      required: true
    },
    type: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = model("Avatar", AvatarSchema);
