const { Schema, model } = require("mongoose");

const TaskSchema = new Schema(
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
      required: true,
      trim: true
    }
  },
  { timestamps: true }
);

TaskSchema.methods.toJSON = function() {
  const task = this;

  const taskObject = task.toObject();

  delete taskObject.owner;

  return taskObject;
};

module.exports = model("Task", TaskSchema);
