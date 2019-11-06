const config = require("config");
const jwt = require("jsonwebtoken");
const AuthToken = require("../models/AuthToken");
const getAccessRights = require("../settings/accessRights/getAccessRights");

module.exports = async (req, res, next) => {
  try {
    res.locals.accessRights = getAccessRights(req.path, req.method);

    if (res.locals.accessRights.routeRights.isPrivate) {
      let authToken;

      if (req.body.refreshToken) {
        const refreshToken = req.body.refreshToken;

        const decoded = jwt.verify(refreshToken, config.get("jwt_secret"));

        res.locals.refreshToken = refreshToken;

        authToken = await AuthToken.findOne({
          owner: decoded._id,
          refreshToken: req.body.refreshToken
        });
      } else {
        const token = req.header("Authorization");

        const decoded = jwt.verify(token, config.get("jwt_secret"));

        res.locals.token = token;

        authToken = await AuthToken.findOne({
          owner: decoded._id,
          token
        });
      }

      if (!authToken) {
        return res.status(401).send({ name: "NoTokenError", code: "NO_TOKEN" });
      }

      await authToken.populate("owner").execPopulate();

      if (!authToken.owner) {
        return res
          .status(401)
          .send({ name: "NotFoundError", code: "USER_NOT_FOUND" });
      }

      if (authToken.owner.disabled > Date.now()) {
        return res
          .status(403)
          .send({ name: "AccessError", code: "ACCOUNT_HAS_BEEN_DISABLED" });
      }

      req.auth = authToken.owner;
    }

    next();
  } catch (err) {
    if (err.name === "NotFoundError") {
      res.status(404).send(err);
    } else if (err.name === "NotAllowedError") {
      res.status(405).send(err);
    } else if (err.name === "JsonWebTokenError") {
      res.status(401).send({
        name: err.name,
        code: err.message
          .toUpperCase()
          .split(" ")
          .join("_")
      });
    } else if (err.name === "TokenExpiredError") {
      res.status(401).send({
        name: err.name,
        code: err.message
          .toUpperCase()
          .split(" ")
          .join("_")
      });
    } else {
      next(err);
    }
  }
};
