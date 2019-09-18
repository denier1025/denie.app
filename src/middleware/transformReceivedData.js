const Task = require("../models/Task");
const Avatar = require("../models/Avatar");
const saveData = require("../utils/saveData");

module.exports = async (req, res, next) => {
  const methodPlusPath = `${req.method}+${req.originalUrl}`;

  const receivedFields = Object.keys(req.body);

  if (methodPlusPath === "POST+/api/users") {
    req.user = new User();

    receivedFields.forEach(receivedField => {
      const fieldParts = receivedField.split(".");

      saveData(req.user, fieldParts, req.body[receivedField]);
    });

    next();
  } else if (methodPlusPath === "PATCH+/api/users/current") {
    receivedFields.forEach(receivedField => {
      const fieldParts = receivedField.split(".");

      saveData(req.user, fieldParts, req.body[receivedField]);
    });

    next();
  } else if (methodPlusPath === "POST+/api/tasks") {
    req.task = new Task();
    req.task.owner = req.user._id;

    receivedFields.forEach(receivedField => {
      const fieldParts = receivedField.split(".");

      saveData(req.task, fieldParts, req.body[receivedField]);
    });

    next();
  } else if (methodPlusPath.match(/(\/api\/tasks\/)[a-f0-9]+$/)) {
    try {
      req.task = await Task.findOne({
        _id: req.params.id,
        owner: req.user._id
      });

      if (!req.task) {
        const error = new Error();
        error.name = "NotFoundError";
        error.message = "task not found";
        throw error;
      }

      receivedFields.forEach(receivedField => {
        const fieldParts = receivedField.split(".");

        saveData(req.task, fieldParts, req.body[receivedField]);
      });

      next();
    } catch (err) {
      if (err.name === "NotFoundError") {
        res.status(404).json(err);
      } else {
        next(err);
      }
    }
  } else if (methodPlusPath === "POST+/api/users/current/avatar") {
    try {
      await req.user.populate("avatars").execPopulate();

      req.avatar = req.user.avatars[0];

      if (!req.avatar) {
        req.avatar = new Avatar();
        req.avatar.owner = req.user._id;
      }

      receivedFields.forEach(receivedField => {
        const fieldParts = receivedField.split(".");

        saveData(req.avatar, fieldParts, req.body[receivedField]);
      });

      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
};
