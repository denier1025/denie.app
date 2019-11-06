const Avatar = require("../models/Avatar");

module.exports = ({ schema, validationPlaces, uniqueFields, model }) => {
  return async (req, res, next) => {
    try {
      const errorObject = {};

      for (let validationPlace of validationPlaces) {
        const { error } = schema[validationPlace].validate(
          req[validationPlace],
          {
            abortEarly: false
          }
        );

        const err = {};

        if (error) {
          error.details.forEach(detail => {
            err[detail.path[0]] = detail.message;
          });
        }

        // TODO: add middleware before validation, for this...
        if (model === Avatar && !Object.keys(err).length) {
          req.body.data = Buffer.from(req.body.data, "base64");
        }

        if (uniqueFields[validationPlace].length) {
          if (Object.keys(err).length) {
            uniqueFields[validationPlace].forEach(uniqueField => {
              if (err[uniqueField]) {
                const index = uniqueFields[validationPlace].indexOf(
                  uniqueField
                );
                if (index > -1) {
                  uniqueFields[validationPlace].splice(index, 1);
                }
              }
            });
          }

          for (let uniqueField of uniqueFields[validationPlace]) {
            const exist = await model.findOne({
              [uniqueField]: req.body[uniqueField]
            });

            if (exist) {
              err[uniqueField] = "must have to be unique";
            }
          }
        }

        if (Object.keys(err).length) {
          errorObject[validationPlace] = err;
        }
      }

      // const { error } = schema.validate(req[validationPlaces], {
      //   abortEarly: false
      // });

      // const err = {};

      // if (error) {
      //   error.details.forEach(detail => {
      //       err[detail.path[0]] = detail.message;
      //   });
      // }

      // // TODO: add middleware before validation, for this...
      // if (model === Avatar && !Object.keys(err).length) {
      //   req.body.data = Buffer.from(req.body.data, "base64");
      // }

      // if (uniqueFields.length) {
      //   if (Object.keys(err).length) {
      //     uniqueFields.forEach(uniqueField => {
      //       if (err[uniqueField]) {
      //         const index = uniqueFields.indexOf(uniqueField);
      //         if (index > -1) {
      //           uniqueFields.splice(index, 1);
      //         }
      //       }
      //     });
      //   }

      //   for (let uniqueField of uniqueFields) {
      //     const model = await model.findOne({
      //       [uniqueField]: req.body[uniqueField]
      //     });

      //     if (model) {
      //       err[uniqueField] = "must have to be unique";
      //     }
      //   }
      // }

      if (Object.keys(errorObject).length) {
        return res
          .status(422)
          .send({ name: "ValidationError", messages: errorObject });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};
