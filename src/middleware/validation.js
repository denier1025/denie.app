const Joi = require("@hapi/joi");
const getAccessRights = require("../settings/accessRights/getAccessRights");
const Avatar = require("../models/Avatar");

module.exports = async (req, res, next) => {
  try {
    if (!res.locals.accessRights) {
      res.locals.accessRights = getAccessRights(req.path, req.method);
    }

    if (res.locals.accessRights.validation) {
      const validationSchema =
        res.locals.accessRights.validation.validationSchema;

      const schema = Joi.object(validationSchema);

      const { error } = schema.validate(req.body, {
        abortEarly: false
      });

      const err = {};

      if (error) {
        error.details.forEach(detail => {
          if (Object.keys(validationSchema).includes(detail.path[0])) {
            err[detail.path[0]] = detail.message;
            return;
          }
        });
      }

      if (
        res.locals.accessRights.validation.model === Avatar &&
        !Object.keys(err).length
      ) {
        req.body.data = Buffer.from(req.body.data, "base64");
      }

      const uniqueFields = res.locals.accessRights.validation.uniqueFields;

      if (uniqueFields.length) {
        if (Object.keys(err).length) {
          uniqueFields.forEach(uniqueField => {
            if (err[uniqueField]) {
              const index = uniqueFields.indexOf(uniqueField);
              if (index > -1) {
                uniqueFields.splice(index, 1);
              }
            }
          });
        }

        // for (let i = 0; i < uniqueFields.length; i++) {
        //   const model = await res.locals.accessRights.validation.model.findOne({
        //     [uniqueFields[i]]: req.body[uniqueFields[i]]
        //   });

        //   if (model) {
        //     err[uniqueFields[i]] = "must have to be unique";
        //   }
        // }

        for (let uniqueField of uniqueFields) {
          const model = await res.locals.accessRights.validation.model.findOne({
            [uniqueField]: req.body[uniqueField]
          });

          if (model) {
            err[uniqueField] = "must have to be unique";
          }
        }
      }

      if (Object.keys(err).length) {
        return res.status(400).send({ name: "ValidationError", messages: err });
      }
    }

    next();
  } catch (err) {
    next(err);
  }
};
