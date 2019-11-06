const Joi = require("@hapi/joi");

const findSetGetUsers = Joi.string()
  .pattern(/^((\$(eq|gt|gte|in|lt|lte|ne|nin)\:)|())[a-zA-Z_]+$/)
  .error(errors => {
    errors.forEach(err => {
      switch (err.code) {
        case "string.base":
          err.message = "can only be a string value";
          break;
        case "string.empty":
          err.message = "can not be empty";
          break;
        case "string.pattern.base":
          err.message =
            "starts with one of $eq:, $gt:, $gte:, $in:, $lt:, $lte:, $ne:, $nin: or nothing, only a-z, A-Z and _";
          break;
        default:
          break;
      }
    });
    return errors;
  });

module.exports = {
  getUsers: Joi.object({
    displayName: findSetGetUsers,
    "email.address": findSetGetUsers,
    "email.isConfirmed": findSetGetUsers,
    disabled: findSetGetUsers,
    role: findSetGetUsers,
    createdAt: findSetGetUsers,
    updatedAt: findSetGetUsers,
    page: Joi.number()
      .integer()
      .error(errors => {
        errors.forEach(err => {
          switch (err.code) {
            case "number.base":
              err.message = "can only be a number value";
              break;
            case "number.integer":
              err.message = "can only be an integer value";
              break;
            default:
              break;
          }
        });
        return errors;
      }),
    sortBy: Joi.string()
      .pattern(/^(disabled|createdAt|updatedAt)\:(-1|1)$/)
      .error(errors => {
        errors.forEach(err => {
          switch (err.code) {
            case "string.base":
              err.message = "can only be a string value";
              break;
            case "string.empty":
              err.message = "can not be empty";
              break;
            case "string.pattern.base":
              err.message = "incorrect format, ex.: createdAt:-1";
              break;
            default:
              break;
          }
        });
        return errors;
      })
  }),
  getUser: Joi.object({
    userId: Joi.string()
      .pattern(/[A-Za-z0-9]+/)
      .length(24)
      .error(errors => {
        errors.forEach(err => {
          switch (err.code) {
            case "string.base":
              err.message = "can only be a string value";
              break;
            case "string.empty":
              err.message = "can not be empty";
              break;
            case "string.pattern.base":
              err.message = "only A-Z, a-z, 0-9";
              break;
            case "string.length":
              err.message = `must be exact ${err.local.limit} characters long`;
              break;
            default:
              break;
          }
        });
        return errors;
      })
  })
};
