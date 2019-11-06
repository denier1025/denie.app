const { Schema, model } = require("mongoose");

const PostSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User"
    },
    title: {
      type: String,
      trim: true,
      required: [true, "can not be blank"],
      minlength: [5, "must be at least 5 characters long"],
      maxlength: [150, "must be no more 150 characters long"]
    },
    subtitle: {
      type: String,
      trim: true
    },
    preview: {
      type: Buffer
    },
    content: {
      type: String,
      trim: true,
      required: [true, "can not be blank"],
      minlength: [150, "must be at least 150 characters long"],
      maxlength: [3600, "must be no more 2600 characters long"]
    },
    tags: {
      type: [String]
    },
    likes: {
      type: [
        {
          owner: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "User"
          },
          createdAt: {
            type: Date,
            default: Date.now
          }
        }
      ]
    },
    dislikes: {
      type: [
        {
          owner: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "User"
          },
          createdAt: {
            type: Date,
            default: Date.now
          }
        }
      ]
    }
  },
  { timestamps: true }
);

module.exports = model("Post", PostSchema);
