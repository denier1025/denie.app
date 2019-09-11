const { Schema, model } = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");
const SALT_WORK_FACTOR = 10;
const EmailConfirmationToken = require("./EmailConfirmationToken");
const AuthToken = require("./AuthToken");
const validator = require("validator");
const { expiresIn } = require("../settings/global");

const UserSchema = new Schema(
  {
    username: {
      type: String,
      trim: true,
      required: [true, "can not be blank"],
      minlength: [5, "must be at least 5 characters long"],
      maxlength: [24, "must be no more 24 characters long"],
      match: [/^[a-zA-Z0-9_]+$/, "is not valid"],
      unique: true,
      index: true
    },
    email: {
      address: {
        type: String,
        trim: true,
        required: [true, "can not be blank"],
        lowercase: true,
        validate: {
          validator: value => validator.isEmail(value),
          message: "is not valid"
        },
        unique: true,
        uniqueCaseInsensitive: true,
        index: true
      },
      isConfirmed: {
        type: Boolean,
        default: false
      }
    },
    password: {
      type: String,
      trim: true,
      required: [true, "can not be blank"],
      minlength: [12, "must be at least 12 characters long"],
      maxlength: [60, "must be no more 60 characters long"],
      match: [/^[a-zA-Z0-9!-~]+$/, "is not valid"]
    }
  },
  { timestamps: true }
);

UserSchema.plugin(uniqueValidator, { message: "is already taken" });

UserSchema.virtual("avatars", {
  ref: "Avatar",
  localField: "_id",
  foreignField: "owner"
});

UserSchema.virtual("tasks", {
  ref: "Task",
  localField: "_id",
  foreignField: "owner"
});

UserSchema.virtual("authTokens", {
  ref: "AuthToken",
  localField: "_id",
  foreignField: "owner"
});

UserSchema.virtual("emailConfirmationTokens", {
  ref: "EmailConfirmationToken",
  localField: "_id",
  foreignField: "owner"
});

UserSchema.statics.findByCredentials = async credentials => {
  const user = await User.findOne({
    "email.address": credentials["email.address"]
  });

  if (!user) {
    const error = new Error();
    error.name = "AuthenticationError";
    error.message = "invalid credentials";
    throw error;
  }

  const isMatch = await bcryptjs.compare(credentials.password, user.password);

  if (!isMatch) {
    const error = new Error();
    error.name = "AuthenticationError";
    error.message = "invalid credentials";
    throw error;
  }

  return user;
};

UserSchema.pre("save", async function(next) {
  const user = this;

  try {
    if (user.isModified("password")) {
      const salt = await bcryptjs.genSalt(SALT_WORK_FACTOR);
      user.password = await bcryptjs.hash(user.password, salt);
    }

    next();
  } catch (err) {
    next(err);
  }
});

UserSchema.methods.toJSON = function() {
  const user = this;

  const userObject = user.toObject();

  delete userObject.password;

  return userObject;
};

UserSchema.methods.generateAuthToken = async function() {
  const user = this;

  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET, {
    expiresIn: expiresIn
  });

  await new AuthToken({ owner: user._id, token }).save();

  return token;
};

UserSchema.methods.checkForEmailConfirmation = async function() {
  const user = this;

  if (!user.email.isConfirmed) {
    const emailConfirmationToken = await EmailConfirmationToken.findOne({
      owner: user._id.toString()
    });

    const error = new Error();
    error.name = "AuthenticationError";
    error.message = `email has not been confirmed, ${
      emailConfirmationToken
        ? "please, check your email for confirmation link"
        : "please, resend the confirmation link to the current email or change the current email to get the confirmation link in it"
    }`;
    error["email.address"] = user.email.address;
    throw error;
  }
};

module.exports = User = model("User", UserSchema);
