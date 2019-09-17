const crypto = require("crypto");
const router = require("express").Router();
const User = require("../../models/User");
const EmailConfirmationToken = require("../../models/EmailConfirmationToken");
const errMsgHandler = require("../../utils/errMsgHandler");
const sendAnError = require("../../utils/sendingEmails/error");
const sendAConfirmationLink = require("../../utils/sendingEmails/confirmationLink");

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
      error.name = "NotFoundError";
      error.message = "link is not valid, try to log in and follow the tips";
      throw error;
    }

    await emailConfirmationToken.populate("owner").execPopulate();

    req.user = emailConfirmationToken.owner;

    if (!req.user) {
      const error = new Error();
      error.name = "NotFoundError";
      error.message =
        "unable to find a user for an existing 'Email Confirmation Token'";
      throw error;
    }

    if (req.user.email.isConfirmed) {
      const error = new Error();
      error.name = "ConfirmationError";
      error.message = "email has already been confirmed";
      throw error;
    }

    req.user.email.isConfirmed = true;

    await req.user.save();

    await emailConfirmationToken.remove();

    res.json({ message: "email has been confirmed" });
  } catch (err) {
    if (err.name === "NotFoundError") {
      res.status(404).json(err);
    } else if (err.name === "ConfirmationError") {
      res.status(400).json(err);
    } else {
      sendAnError(err);

      res.status(500).json({
        name: "InternalServerError",
        message: "we already notified about this error"
      });
    }
  }
});

// @route   POST api/confirmation/email/resend
// @desc    Resend a confirmation link to the registered email
// @access  Public
router.post("/resend", async (req, res) => {
  try {
    req.user = await User.findOne({
      "email.address": req.body["email.address"]
    });

    if (!req.user) {
      const error = new Error();
      error.name = "NotFoundError";
      error.message = "unable to find a user with that email";
      throw error;
    }

    if (req.user.email.isConfirmed) {
      const error = new Error();
      error.name = "ConfirmationError";
      error.message = "email has already been confirmed";
      throw error;
    }

    await EmailConfirmationToken.deleteMany({ owner: req.user._id });

    const emailConfirmationToken = await new EmailConfirmationToken({
      owner: req.user._id,
      token: crypto.randomBytes(16).toString("hex")
    }).save();

    await sendAConfirmationLink(req, emailConfirmationToken);

    res.json({
      message: `a confirmation link has been sent to ${req.user.email.address}`,
      "email.address": req.user.email.address
    });
  } catch (err) {
    if (err.name === "NotFoundError") {
      res.status(404).json(err);
    } else if (err.name === "ConfirmationError") {
      res.status(400).json(err);
    } else {
      sendAnError(err);

      res.status(500).json({
        name: "InternalServerError",
        message: "we already notified about this error"
      });
    }
  }
});

// @route   POST POST api/confirmation/email/change
// @desc    Change an unconfirmed email
// @access  Public
router.post("/change", async (req, res) => {
  try {
    req.user = await User.findOne({
      "email.address": req.body["email.address"]
    });

    if (!req.user) {
      const error = new Error();
      error.name = "NotFoundError";
      error.message =
        "incorrect autofilling fields, try to log in and follow the tips";
      throw error;
    }

    if (req.user.email.isConfirmed) {
      const error = new Error();
      error.name = "ConfirmationError";
      error.message = "email has already been confirmed";
      throw error;
    }

    await EmailConfirmationToken.deleteMany({ owner: req.user._id });

    req.user.email.address = req.body["email.newAddress"];

    req.user = await req.user.save();

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
      "email.address": req.user.email.address
    });
  } catch (err) {
    if (err.name === "NotFoundError") {
      res.status(404).json(err);
    } else if (err.name === "ValidationError") {
      err.message = errMsgHandler(err);

      res.status(400).json(err);
    } else if (err.name === "ConfirmationError") {
      res.status(400).json(err);
    } else {
      sendAnError(err);

      res.status(500).json({
        name: "InternalServerError",
        message: "we already notified about this error"
      });
    }
  }
});

module.exports = router;
