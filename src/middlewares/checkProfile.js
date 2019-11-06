const roleTypes = require("../settings/roleTypes");

module.exports = options => {
  return async (req, res, next) => {
    try {
      res.locals.profile = await User.findById(req.params.userId).lean();

      if (!res.locals.profile) {
        return res
          .status(404)
          .send({ name: "NotFoundError", code: "USER_NOT_FOUND" });
      }

      if (!options.readable) {
        const isMatch = new RegExp(
          "^\\/api\\/users\\/[A-Za-z0-9]{24}\\/role\\/?$"
        ).test(req.path);

        if (isMatch && req.method === "PATCH") {
          if (roleTypes[res.locals.auth.role] <= roleTypes[req.body.role]) {
            return res.status(403).send({
              name: "AccessError",
              code: "MODIFY_ROLE_ON_EQUIVALENT_OR_HIGHER_THAN_YOURS_NOT_ALLOWED"
            });
          }
        }

        if (
          res.locals.auth._id === res.locals.profile._id &&
          !options.selfMod
        ) {
          return res.status(403).send({
            name: "AccessError",
            code: "MODIFY_YOURSELF_NOT_ALLOWED"
          });
        }

        if (options.otherMod) {
          if (
            res.locals.auth._id !== res.locals.profile._id &&
            res.locals.auth.role === res.locals.profile.role
          ) {
            return res.status(403).send({
              name: "AccessError",
              code: "MODIFY_IDENTICAL_ROLE_NOT_ALLOWED"
            });
          }

          if (
            roleTypes[res.locals.auth.role] < roleTypes[res.locals.profile.role]
          ) {
            return res.status(403).send({
              name: "AccessError",
              code: "MODIFY_HIGH_ORDER_ROLE_NOT_ALLOWED"
            });
          }
        }
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};
