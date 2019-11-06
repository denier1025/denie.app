const crypto = require("crypto");
const router = require("express").Router();
const User = require("../../../models/User");
const EmailConfirmationToken = require("../../../models/EmailConfirmationToken");
const sendAnError = require("../../../utils/sendingEmails/error");
const sendAConfirmationLink = require("../../../utils/sendingEmails/confirmationLink");
const sendData = require("../../../utils/sendData");
const dotize = require("../../../utils/dotize");

// @route   GET api/confirmation/email/:token
// @desc    Confirm a registered email
// @access  Public
router.get("/email/:token", async (req, res) => {
  try {
    const emailConfirmationToken = await EmailConfirmationToken.findOne({
      token: req.params.token
    });

    if (!emailConfirmationToken) {
      return res
        .status(404)
        .send({ name: "NotFoundError", code: "ECT_NOT_FOUND" });
    }

    await emailConfirmationToken.populate("owner").execPopulate();

    const profile = emailConfirmationToken.owner;

    if (!profile) {
      return res
        .status(404)
        .send({ name: "NotFoundError", code: "USER_NOT_FOUND" });
    }

    if (profile.email.isConfirmed) {
      return res
        .status(400)
        .send({ name: "ConfirmationError", code: "EMAIL_ALREADY_CONFIRMED" });
    }

    profile.email.isConfirmed = true;

    await profile.save();

    await emailConfirmationToken.remove();

    res.redirect("/");
  } catch (err) {
    sendAnError(err);

    res.status(500).send({
      name: "InternalServerError",
      code: "INTERNAL_SERVER_ERROR"
    });
  }
});

// @route   POST api/confirmation/email/resend
// @desc    Resend a confirmation link to the registered email
// @access  Public
router.post("/email/resend", async (req, res) => {
  try {
    const profile = await User.findOne({
      "email.address": dotize.backward(req.body).email.address
    });

    if (!profile) {
      return res
        .status(400)
        .send({ name: "NotFoundError", code: "USER_NOT_FOUND" });
    }

    if (profile.email.isConfirmed) {
      return res
        .status(400)
        .send({ name: "ConfirmationError", code: "EMAIL_ALREADY_CONFIRMED" });
    }

    await EmailConfirmationToken.deleteMany({ owner: profile._id });

    const emailConfirmationToken = await new EmailConfirmationToken({
      owner: profile._id,
      token: crypto.randomBytes(16).toString("hex")
    }).save();

    await sendAConfirmationLink(req, emailConfirmationToken);

    const data = sendData(
      profile.toObject(),
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

// @route   POST POST api/confirmation/email/change
// @desc    Change an unconfirmed email
// @access  Public
router.post("/email/change", async (req, res) => {
  try {
    req.body = dotize.backward(req.body);

    const profile = await User.findOne({
      "email.address": req.body.email.address
    });

    if (!profile) {
      return res
        .status(404)
        .send({ name: "NotFoundError", code: "USER_NOT_FOUND" });
    }

    if (profile.email.isConfirmed) {
      return res
        .status(400)
        .send({ name: "ConfirmationError", code: "EMAIL_ALREADY_CONFIRMED" });
    }

    await EmailConfirmationToken.deleteMany({ owner: profile._id });

    profile.email.address = req.body.email.newAddress;

    await profile.save();

    // const updatedEmail = await User.findByIdAndUpdate(
    //   user._id,
    //   {
    //     $set: {
    //       email: {
    //          address: req.body["email.newAddress"]
    //       }
    //     }
    //   },
    //   { new: true, runValidators: true, context: "query" }
    // );

    const data = sendData(
      profile.toObject(),
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
