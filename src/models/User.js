const config = require("config");
const { Schema, model } = require("mongoose");
const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");
const SALT_WORK_FACTOR = 10;
const AuthToken = require("./AuthToken");
const { tokenExp, refreshTokenExp } = require("../settings/global");

const UserSchema = new Schema(
  {
    displayName: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    email: {
      address: {
        type: String,
        required: true,
        unique: true,
        index: true
      },
      isConfirmed: {
        type: Boolean,
        default: true
      }
    },
    // isAnonymous: {
    //   type: Boolean,
    //   default: false
    // },
    disabled: {
      type: Date,
      default: Date.now()
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      default: "user"
    }
  },
  { timestamps: true }
);

UserSchema.virtual("todos", {
  ref: "Todo",
  localField: "_id",
  foreignField: "owner"
});

UserSchema.virtual("posts", {
  ref: "Post",
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

UserSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();

  const salt = await bcryptjs.genSalt(SALT_WORK_FACTOR);

  this.password = await bcryptjs.hash(this.password, salt);

  next();
});

UserSchema.methods.comparePasswords = async plain => {
  return await bcryptjs.compare(plain, this.password);
};

UserSchema.statics.findByCredentials = async ({
  email: { address },
  password
}) => {
  const profile = await User.findOne({
    "email.address": address
  });

  if (!profile) {
    const error = new Error();
    error.name = "CredentialsError";
    error.code = "INVALID_CREDENTIALS";
    throw error;
  }

  const isMatch = profile.comparePasswords(password);

  if (!isMatch) {
    const error = new Error();
    error.name = "CredentialsError";
    error.code = "INVALID_CREDENTIALS";
    throw error;
  }

  return profile;
};

UserSchema.methods.generateAuthToken = async function() {
  const token = jwt.sign(
    { _id: this._id.toString() },
    config.get("jwt_secret"),
    {
      expiresIn: tokenExp
    }
  );

  const refreshToken = jwt.sign(
    { _id: this._id.toString() },
    config.get("jwt_secret"),
    {
      expiresIn: refreshTokenExp
    }
  );

  return await new AuthToken({ owner: this._id, token, refreshToken }).save();
};

UserSchema.methods.checkForEmailConfirmation = function() {
  if (!this.email.isConfirmed) {
    const error = new Error();
    error.name = "ConfirmationError";
    error.code = "EMAIL_NOT_CONFIRMED";
    throw error;
  }
};

module.exports = User = model("User", UserSchema);
