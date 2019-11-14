const Joi = require("@hapi/joi");

const findSetJoiSchema = Joi.string()
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

const userIdJoiSchema = Joi.string()
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
  });

const displayNameJoiSchema = Joi.string()
  .pattern(/^[a-zA-Z]{5,32}[0-9]{0,32}$/)
  .min(5)
  .max(64)
  .required()
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
          err.message = "starts with 5 alphabetic chars, only A-Z, a-z, 0-9";
          break;
        case "string.min":
          err.message = `must be at least ${err.local.limit} characters long`;
          break;
        case "string.max":
          err.message = `must be no more ${err.local.limit} characters long`;
          break;
        case "any.required":
          err.message = "can not be blank";
          break;
        default:
          break;
      }
    });
    return errors;
  });

const emailAddressJoiSchema = Joi.string()
  .case("lower")
  .pattern(
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  )
  .min(6)
  .max(254)
  .required()
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
          err.message = "invalid email format, ex.: example@email.com";
          break;
        case "string.min":
          err.message = `must be at least ${err.local.limit} characters long`;
          break;
        case "string.max":
          err.message = `must be no more ${err.local.limit} characters long`;
          break;
        case "any.required":
          err.message = "can not be blank";
          break;
        default:
          break;
      }
    });
    return errors;
  });

const passwordJoiSchema = Joi.string()
  .pattern(/^[ -~]+$/)
  .min(12)
  .max(32)
  .required()
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
            "all printable ASCII chars, ex.: A-Z, a-z, 0-9, !, @, #, $, %...";
          break;
        case "string.min":
          err.message = `must be at least ${err.local.limit} characters long`;
          break;
        case "string.max":
          err.message = `must be no more ${err.local.limit} characters long`;
          break;
        case "any.required":
          err.message = "can not be blank";
          break;
        default:
          break;
      }
    });
    return errors;
  });

module.exports = {
  getUsersJoiSchema: {
    query: Joi.object({
      displayName: findSetJoiSchema,
      "email.address": findSetJoiSchema,
      "email.isConfirmed": findSetJoiSchema,
      disabled: findSetJoiSchema,
      role: findSetJoiSchema,
      createdAt: findSetJoiSchema,
      updatedAt: findSetJoiSchema,
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
    })
  },
  getUserJoiSchema: {
    params: Joi.object({
      userId: userIdJoiSchema
    })
  },
  postUserJoiSchema: {
    body: Joi.object({
      displayName: displayNameJoiSchema,
      "email.address": emailAddressJoiSchema,
      password: passwordJoiSchema
    })
  },
  patchUserDisplayNameJoiSchema: {
    params: Joi.object({
      userId: userIdJoiSchema
    }),
    body: Joi.object({
      displayName: displayNameJoiSchema
    })
  },
  patchUserEmailAddressJoiSchema: {
    params: Joi.object({
      userId: userIdJoiSchema
    }),
    body: Joi.object({
      "email.address": emailAddressJoiSchema,
      new: emailAddressJoiSchema
    }).with("email.address", "new")
  },
  patchUserPasswordJoiSchema: {
    params: Joi.object({
      userId: userIdJoiSchema
    }),
    body: Joi.object({
      password: passwordJoiSchema,
      new: passwordJoiSchema
    }).with("password", "new")
  },
  deleteUserJoiSchema: {
    params: Joi.object({
      userId: userIdJoiSchema
    })
  },
  deleteUserDisplayNameJoiSchema: {
    params: Joi.object({
      userId: userIdJoiSchema
    })
  }
};
