const config = require("config");
const jwt = require("jsonwebtoken");
const AuthToken = require("../models/AuthToken");

module.exports = async (req, res, next) => {
  try {
    let authToken;

    const refreshToken = req.body.refreshToken;

    if (refreshToken) {
      const decoded = jwt.verify(refreshToken, config.get("jwt_secret"));

      res.locals.refreshToken = refreshToken;

      authToken = await AuthToken.findOne({
        owner: decoded._id,
        refreshToken
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

    if (authToken.owner.disabled && authToken.owner.disabled > Date.now()) {
      return res
        .status(403)
        .send({ name: "AccessError", code: "ACCOUNT_HAS_BEEN_DISABLED" });
    }

    res.locals.auth = authToken.owner;

    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
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
