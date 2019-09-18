const crypto = require("crypto");
const router = require("express").Router();
const auth = require("../middleware/auth");
const EmailConfirmationToken = require("../models/EmailConfirmationToken");
const errMsgHandler = require("../utils/errMsgHandler");
const swapFieldsAvatarRelated = require("../middleware/swapFieldsAvatarRelated");
const checkFieldsOnAccess = require("../middleware/checkFieldsOnAccess");
const transformReceivedData = require("../middleware/transformReceivedData");
const sendAnError = require("../utils/sendingEmails/error");
const sendAConfirmationLink = require("../utils/sendingEmails/confirmationLink");

// @route   POST api/users
// @desc    Register a user
// @access  Public
router.post(
  "/",
  checkFieldsOnAccess,
  transformReceivedData,
  async (req, res) => {
    try {
      req.user = await req.user.save();

      const emailConfirmationToken = await new EmailConfirmationToken({
        owner: req.user._id,
        token: crypto.randomBytes(16).toString("hex")
      }).save();

      await sendAConfirmationLink(req, emailConfirmationToken);

      res.status(201).json({
        message: `a confirmation link has been sent to ${req.user.email.address}`,
        "email.address": req.user.email.address
      });
    } catch (err) {
      if (err.name === "ValidationError") {
        res.status(400).json({name: err.name, message: errMsgHandler(err)});
      } else if (err.name === "AccessError") {
        res.status(403).json(err);
      } else {
        sendAnError(err);

        res.status(500).json({
          name: "InternalServerError",
          message: "we already notified about this error"
        });
      }
    }
  }
);

// @route   GET api/users/current
// @desc    Fetch a current user
// @access  Private
router.get("/current", auth, async (req, res) => {
  res.json(req.user);
});

// @route   PATCH api/users/current
// @desc    Update a current user's fields
// @access  Private
router.patch(
  "/current",
  auth,
  checkFieldsOnAccess,
  transformReceivedData,
  async (req, res) => {
    try {
      req.user = await req.user.save();

      res.json(req.user);
    } catch (err) {
      if (err.name === "ValidationError") {
        res.status(400).json({name: err.name, message: errMsgHandler(err)});
      } else if (err.name === "AccessError") {
        res.status(403).json(err);
      } else {
        sendAnError(err);

        res.status(500).json({
          name: "InternalServerError",
          message: "we already notified about this error"
        });
      }
    }
  }
);

// @route   POST api/users/current/avatar
// @desc    Upload a current avatar
// @access  Private
router.post(
  "/current/avatar",
  auth,
  swapFieldsAvatarRelated,
  checkFieldsOnAccess,
  transformReceivedData,
  async (req, res) => {
    try {
      await req.avatar.save();

      res.json();
    } catch (err) {
      if (err.name === "ValidationError") {
        res.status(400).json({name: err.name, message: errMsgHandler(err)});
      } else {
        sendAnError(err);

        res.status(500).json({
          name: "InternalServerError",
          message: "we already notified about this error"
        });
      }
    }
  }
);

// @route   GET api/users/current/avatar
// @desc    Fetch a current avatar
// @access  Private
router.get("/current/avatar", auth, async (req, res) => {
  try {
    await req.user.populate("avatars").execPopulate();

    const avatar = req.user.avatars[0];

    if (!avatar) {
      const error = new Error();
      error.name = "NotFoundError";
      error.message = "avatar not found";
      throw error;
    }

    res.json(avatar);
  } catch (err) {
    if (err.name === "NotFoundError") {
      res.status(404).json(err);
    } else {
      sendAnError(err);

      res.status(500).json({
        name: "InternalServerError",
        message: "we already notified about this error"
      });
    }
  }
});

// @route   DELETE api/users/current/avatar
// @desc    Remove a current avatar
// @access  Private
router.delete("/current/avatar", auth, async (req, res) => {
  try {
    await req.user.populate("avatars").execPopulate();

    const avatar = req.user.avatars[0];

    if (!avatar) {
      const error = new Error();
      error.name = "NotFoundError";
      error.message = "avatar not found";
      throw error;
    }

    await avatar.remove();

    res.status(204).json();
  } catch (err) {
    if (err.name === "NotFoundError") {
      res.status(404).json(err);
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
