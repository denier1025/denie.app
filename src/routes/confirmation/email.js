const crypto = require("crypto");
const router = require("express").Router();
const User = require("../../models/User");
const EmailConfirmationToken = require("../../models/EmailConfirmationToken");
const errMsgHandler = require("../../utils/errMsgHandler");
const internalServerError = require("../sharedParts/internalServerError")
const inconsistencyError = require("../sharedParts/inconsistencyError")

// @route   GET api/confirmation/email/:token
// @desc    Confirm a registered email
// @access  Public
router.get("/:token", async (req, res) => {
  try {
    const emailConfirmationToken = await EmailConfirmationToken.findOne({
      token: req.params.token
    });

    if (!emailConfirmationToken) {
      const error = new Error();
      error.name = "ConfirmationError";
      error.message = "link is not valid, try to log in and follow the tips";
      throw error;
    }

    await emailConfirmationToken.populate("owner").execPopulate();

    const user = emailConfirmationToken.owner;

    if (!user) {
      const error = new Error();
      error.name = "InconsistencyError";
      error.message =
        "unable to find a user for an existing 'Email Confirmation Token'";
      throw error;
    }

    if (user.email.isConfirmed) {
      const error = new Error();
      error.name = "ConfirmationError";
      error.message = "email has already been confirmed";
      throw error;
    }

    user.email.isConfirmed = true;

    await user.save();

    await emailConfirmationToken.remove();

    res.json({ message: "email has been confirmed" });
  } catch (err) {
    if (err.name === "ConfirmationError") {
      res.status(400).json(err);
    } else if (err.name === "InconsistencyError") {
      inconsistencyError(err)
    } else {
      internalServerError(err)
    }
  }
});

// @route   POST api/confirmation/email/resend
// @desc    Resend a confirmation link to the registered email
// @access  Public
router.post("/resend", async (req, res) => {
  try {
    const user = await User.findOne({
      "email.address": req.body["email.address"]
    });

    if (!user) {
      const error = new Error();
      error.name = "ConfirmationError";
      error.message = "unable to find a user with that email";
      throw error;
    }

    if (user.email.isConfirmed) {
      const error = new Error();
      error.name = "ConfirmationError";
      error.message = "email has already been confirmed";
      throw error;
    }

    await EmailConfirmationToken.deleteMany({ owner: user._id });

    const emailConfirmationToken = await new EmailConfirmationToken({
      owner: user._id,
      token: crypto.randomBytes(16).toString("hex")
    }).save();

    await sendingConfirmationLink(req, user, emailConfirmationToken)

    res.json({
      message: `a confirmation link has been sent to ${user.email.address}`,
      "email.address": user.email.address
    });
  } catch (err) {
    if (err.name === "ConfirmationError") {
      res.status(400).json(err);
    } else {
      internalServerError(err)
    }
  }
});

// @route   POST POST api/confirmation/email/change
// @desc    Change an unconfirmed email
// @access  Public
router.post("/change", async (req, res) => {
  try {
    let user = await User.findOne({
      "email.address": req.body["email.address"]
    });

    if (!user) {
      const error = new Error();
      error.name = "ConfirmationError";
      error.message =
        "incorrect autofilling fields, try to log in and follow the tips";
      throw error;
    }

    if (user.email.isConfirmed) {
      const error = new Error();
      error.name = "ConfirmationError";
      error.message = "email has already been confirmed";
      throw error;
    }

    await EmailConfirmationToken.deleteMany({ owner: user._id });

    user.email.address = req.body["email.newAddress"];

    user = await user.save();

    // const updatedEmail = await User.findByIdAndUpdate(
    //   user._id,
    //   {
    //     $set: {
    //       email: {
    //          address: req.body["email.newAddress"]
    //       }
    //     }
    //   },
    //   { new: true, runValidators: true, context: "query", fields: "-_id email" }
    // );

    res.json({
      message: "email has been changed",
      "email.address": user.email.address
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      res
        .status(400)
        .json({ name: "ValidationError", message: errMsgHandler(err) });
    } else if (err.name === "ConfirmationError") {
      res.status(400).json(err);
    } else {
      internalServerError(err)
    }
  }
});

module.exports = router;
