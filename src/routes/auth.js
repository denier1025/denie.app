const router = require("express").Router();
const auth = require("../middleware/auth");
const User = require("../models/User");
const AuthToken = require("../models/AuthToken");
const sendAnError = require("../utils/sendingEmails/error");

// @route   POST api/auth
// @desc    Get an authentication token
// @access  Public
router.post("/", async (req, res) => {
  try {
    req.user = await User.findByCredentials(req.body);

    await req.user.checkForEmailConfirmation();

    // TODO: isFrozen

    const token = await req.user.generateAuthToken();

    res.json({ token });
  } catch (err) {
    if (
      err.name === "CredentialsError" ||
      err.name === "ConfirmationError"
    ) {
      res.status(401).json(err);
    } else {
      sendAnError(err);

      res.status(500).json({
        name: "InternalServerError",
        message: "we already notified about this error"
      });
    }
  }
});

// @route   DELETE api/auth
// @desc    Remove an authentication token
// @access  Private
router.delete("/", auth, async (req, res) => {
  try {
    if (req.query.opt) {
      if (req.query.opt === "all") {
        await AuthToken.deleteMany({
          owner: req.user._id
        });
      } else {
        const error = new Error();
        error.name = "QueryStringError";
        error.message = "not valid query-string";
        throw error;
      }
    } else {
      await AuthToken.deleteOne({
        owner: req.user._id,
        token: req.token
      });
    }

    res.status(204).json();
  } catch (err) {
    if (err.name === "QueryStringError") {
      return res.status(400).json(err);
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
