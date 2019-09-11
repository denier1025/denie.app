const User = require("../models/User");
const Avatar = require("../models/Avatar");
const Task = require("../models/Task");

module.exports = (req, res, next) => {
  const methodPlusPath = `${req.method}+${req.originalUrl}`;
  try {
    if (methodPlusPath === "POST+/api/users") {
      const userFields = Object.keys(User.schema.paths);
      const receivedFields = Object.keys(req.body);

      const filteredFields = receivedFields.filter(receivedField =>
        userFields.includes(receivedField)
      );

      const allowedFields = ["username", "email.address", "password"];
      const isAllowedOperation = filteredFields.every(filteredField =>
        allowedFields.includes(filteredField)
      );

      if (!isAllowedOperation) {
        const error = new Error();
        error.name = "AccessError";
        error.message = "not enough rights";
        throw error;
      }

      next();
    } else if (methodPlusPath === "PATCH+/api/users/current") {
      const userFields = Object.keys(User.schema.paths);
      const receivedFields = Object.keys(req.body);

      const filteredFields = receivedFields.filter(receivedField =>
        userFields.includes(receivedField)
      );

      const allowedFields = ["username", "email.address", "password"];
      const isAllowedOperation = filteredFields.every(filteredField =>
        allowedFields.includes(filteredField)
      );

      if (!isAllowedOperation) {
        const error = new Error();
        error.name = "AccessError";
        error.message = "not enough rights";
        throw error;
      }

      next();
    } else if (methodPlusPath === "POST+/api/tasks") {
      const taskFields = Object.keys(Task.schema.paths);
      const receivedFields = Object.keys(req.body);

      const filteredFields = receivedFields.filter(receivedField =>
        taskFields.includes(receivedField)
      );

      const allowedFields = ["todo"];
      const isAllowedOperation = filteredFields.every(filteredField =>
        allowedFields.includes(filteredField)
      );

      if (!isAllowedOperation) {
        const error = new Error();
        error.name = "AccessError";
        error.message = "not enough rights";
        throw error;
      }

      next();
    } else if (methodPlusPath === "PATCH+/api/tasks/:id") {
      const taskFields = Object.keys(Task.schema.paths);
      const receivedFields = Object.keys(req.body);

      const filteredFields = receivedFields.filter(receivedField =>
        taskFields.includes(receivedField)
      );

      const allowedFields = ["done", "todo"];
      const isAllowedOperation = filteredFields.every(filteredField =>
        allowedFields.includes(filteredField)
      );

      if (!isAllowedOperation) {
        const error = new Error();
        error.name = "AccessError";
        error.message = "not enough rights";
        throw error;
      }

      next();
    } else if (methodPlusPath === "POST+/api/users/current/avatar") {
      const avatarFields = Object.keys(Avatar.schema.paths);
      const receivedFields = Object.keys(req.body);

      const filteredFields = receivedFields.filter(receivedField =>
        avatarFields.includes(receivedField)
      );

      const allowedFields = ["extension", "buffer"];
      const isAllowedOperation = filteredFields.every(filteredField =>
        allowedFields.includes(filteredField)
      );

      if (!isAllowedOperation) {
        const error = new Error();
        error.name = "AccessError";
        error.message = "not enough rights";
        throw error;
      }

      next();
    } else {
      next();
    }
  } catch (err) {
    if (err.name === "AccessError") {
      res.status(403).json(err);
    } else {
      next(err)
    }
  }
};
