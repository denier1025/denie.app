const User = require("../models/User");
const sendData = require("../utils/sendData");
const sendAnError = require("../utils/sendingEmails/error");

// @route   GET api/users?disabled=$gt:1572946923995&email.isConfirmed=true
// @route   GET api/users?sortBy=createdAt:-1
// @route   GET api/users?page=2
// @desc    Get all users
// @access  Private
exports.getUsers = allowedToSend => {
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

// @route   GET api/users/:userId
// @desc    Get a user
// @access  Private
exports.getUser = allowedToSend => {
  return async (req, res) => {
    try {
      const data = sendData(res.locals.profile, allowedToSend);
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
