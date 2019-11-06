const { Schema, model } = require("mongoose");

const TodoSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User"
    },
    done: {
      type: Boolean,
      default: false
    },
    todo: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = model("Todo", TodoSchema);
