const User = require("../models/User");
const sendData = require("../utils/sendData");
const sendAnError = require("../utils/sendingEmails/error");
const dotize = require("../utils/dotize")
const combineData = require("../utils/combineData")

// @route   GET api/users?disabled=$gt:1572946923995&email.isConfirmed=true
// @route   GET api/users?sortBy=createdAt:-1
// @route   GET api/users?page=2
// @desc    Get all users
// @access  Private
exports.getUsersController = allowedToSend => {
  return async (req, res) => {
    try {
      const sort = {};

      if (req.query.sortBy) {
        const parts = req.query.sortBy.split(":");
        sort[parts[0]] = parts[1];
      }

      const limit = 5;
      let skip = 0;

      if (req.query.page) {
        skip = parseInt(req.query.page) * limit - limit;
      }

      const findSet = {};

      const receivedUserFileds = Object.keys(req.query).filter(receiveField =>
        Object.keys(User.schema.paths).includes(receiveField)
      );

      receivedUserFileds.forEach(receivedUserFiled => {
        const parts = req.query[receivedUserFiled].split(":");

        let findVal = "";

        if (parts.length === 1) {
          findVal = parts[0];
        } else {
          if (parts[0] === "$in" || parts[0] === "$nin") {
            parts[1] = JSON.parse(parts[1]);
          }

          findVal = {};

          findVal[parts[0]] = parts[1];
        }

        findSet[receivedUserFiled] = findVal;
      });

      const profiles = await User.find(findSet)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean();

      const data = sendData(profiles, allowedToSend);
      data ? res.send(data) : res.end();
    } catch (err) {
      sendAnError(err);

      return res.status(500).send({
        name: "InternalServerError",
        code: "INTERNAL_SERVER_ERROR"
      });
    }
  };
};

// @route   GET api/users/current
// @desc    Fetch a current user
// @access  Private
exports.getUserCurrentController = allowedToSend => {
  return async (req, res) => {
    try {
      const data = sendData(res.locals.auth.toObject(), allowedToSend);
      data ? res.send(data) : res.end();
    } catch (err) {
      sendAnError(err);

      res.status(500).send({
        name: "InternalServerError",
        code: "INTERNAL_SERVER_ERROR"
      });
    }
  };
};

// @route   GET api/users/:userId
// @desc    Get a user
// @access  Private
exports.getUserController = allowedToSend => {
  return async (req, res) => {
    try {
      const data = sendData(res.locals.profile.toObject(), allowedToSend);
      data ? res.send(data) : res.end();
    } catch (err) {
      sendAnError(err);

      res.status(500).send({
        name: "InternalServerError",
        code: "INTERNAL_SERVER_ERROR"
      });
    }
  };
};

// @route   POST api/users
// @desc    Register a user
// @access  Public
exports.postUserController = allowedToSend => {
  return async (req, res) => {
    try {
      const profile = new User();

      combineData(profile, dotize.backward(req.body));

      await profile.save();

      // const emailConfirmationToken = await new EmailConfirmationToken({
      //   owner: profile._id,
      //   token: crypto.randomBytes(16).toString("hex")
      // }).save();
      // await sendAConfirmationLink(req, emailConfirmationToken);

      const data = sendData(profile.toObject(), allowedToSend);
      data ? res.status(201).send(data) : res.status(201).end();
    } catch (err) {
      sendAnError(err);

      res.status(500).send({
        name: "InternalServerError",
        code: "INTERNAL_SERVER_ERROR"
      });
    }
  };
};

// @route   PATCH api/users/:userId/displayName
// @desc    Update a user displayName
// @access  Private
exports.patchUserDisplayNameController = allowedToSend => {
  return async (req, res) => {
    try {
      combineData(res.locals.profile, dotize.backward(req.body));

      await res.locals.profile.save();

      const data = sendData(res.locals.profile.toObject(), allowedToSend);
      data ? res.send(data) : res.end();
    } catch (err) {
      sendAnError(err);

      res.status(500).send({
        name: "InternalServerError",
        code: "INTERNAL_SERVER_ERROR"
      });
    }
  };
};

// @route   DELETE api/users/:userId
// @desc    Delete a user
// @access  Private
exports.deleteUserController = allowedToSend => {
  return async (req, res) => {
    try {
      await res.locals.profile.deleteOne();

      const data = sendData(res.locals.profile.toObject(), allowedToSend);
      data ? res.status(200).send(data) : res.status(204).end();
    } catch (err) {
      sendAnError(err);

      res.status(500).send({
        name: "InternalServerError",
        code: "INTERNAL_SERVER_ERROR"
      });
    }
  };
};
