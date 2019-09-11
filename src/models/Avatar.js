const { Schema, model } = require("mongoose");
const { avatarSize } = require("../settings/global");

const AvatarSchema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },
  buffer: {
    type: Buffer,
    required: [true, "can not be blank"],
    validate: {
      validator: value => value.length <= avatarSize,
      message: `no more ${avatarSize} bytes of size`
    }
  },
  extension: {
    type: String,
    trim: true,
    required: [true, "can not be blank"],
    enum: {
      values: ["png", "jpg", "jpeg", "gif"],
      message: "invalid file extension"
    }
  }
});

AvatarSchema.methods.toJSON = function() {
  const avatar = this;

  const avatarObject = avatar.toObject();

  avatarObject.base64Data = avatarObject.buffer.toString("base64")

  delete avatarObject.buffer
  delete avatarObject.owner;

  return avatarObject;
};

module.exports = model("Avatar", AvatarSchema);
