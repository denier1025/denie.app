const router = require("express").Router();
const User = require("../../models/User");
const AuthToken = require("../../models/AuthToken");
const sendAnError = require("../../utils/sendingEmails/error");
const sendData = require("../../utils/sendData");
const dotize = require("../../utils/dotize");

// @route   POST api/auth
// @desc    Get authorization and refresh tokens
// @access  Public
router.post("/auth", async (req, res) => {
  try {
    const profile = await User.findByCredentials(dotize.backward(req.body));

    profile.checkForEmailConfirmation();

    if (profile.disabled > Date.now()) {
      return res
        .status(403)
        .send({ name: "AccessError", code: "ACCOUNT_HAS_BEEN_DISABLED" });
    }

    const authToken = await profile.generateAuthToken();

    const data = sendData(
      authToken.toObject(),
      res.locals.roleRights.allowedToSend
    );
    data ? res.send(data) : res.end();
  } catch (err) {
    if (err.name === "CredentialsError" || err.name === "ConfirmationError") {
      res.status(400).send(err);
    } else {
      sendAnError(err);

      res.status(500).send({
        name: "InternalServerError",
        code: "INTERNAL_SERVER_ERROR"
      });
    }
  }
});

// @route   DELETE api/auth?del=cur
// @route   DELETE api/auth?del=all
// @desc    Remove an authentication token
// @access  Private
router.delete("/auth", async (req, res) => {
  try {
    if (req.query.del) {
      if (req.query.del === "all") {
        await AuthToken.deleteMany({
          owner: req.user._id
        });
      } else if (req.query.del === "cur") {
        await AuthToken.deleteOne({
          owner: req.user._id,
          token: res.locals.token
        });
      } else {
        return res
          .status(400)
          .send({ name: "QueryStringError", code: "INVALID_QUERY_STRING" });
      }
    } else {
      return res.status(400).send({ name: "UrlError", code: "INVALID_URL" });
    }

    res.status(204).end();
  } catch (err) {
    sendAnError(err);

    res.status(500).send({
      name: "InternalServerError",
      code: "INTERNAL_SERVER_ERROR"
    });
  }
});

// @route   POST api/auth/refresh
// @desc    Get authorization and refresh tokens
// @access  Private
router.post("/auth/refresh", async (req, res) => {
  try {
    // TODO: transaction must have!

    // await req.user.deleteOne({
    //   owner: req.user._id,
    //   refreshToken: res.locals.refreshToken
    // });

    const authToken = await req.user.generateAuthToken();

    const data = sendData(
      authToken.toObject(),
      res.locals.roleRights.allowedToSend
    );
    data ? res.send(data) : res.end();
  } catch (err) {
    sendAnError(err);

    res.status(500).send({
      name: "InternalServerError",
      code: "INTERNAL_SERVER_ERROR"
    });
  }
});

module.exports = router;
