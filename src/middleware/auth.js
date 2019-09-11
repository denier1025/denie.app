const jwt = require("jsonwebtoken");
const { expiresIn, refreshPeriod } = require("../settings/global");
const AuthToken = require("../models/AuthToken");

module.exports = async (req, res, next) => {
  let token = req.header("Authorization");

  if (token) {
    token = token.replace("Bearer ", "");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const authToken = await AuthToken.findOne({
      owner: decoded._id,
      token
    });

    if (!authToken) {
      const error = new Error();
      error.name = "JsonWebTokenError";
      error.message = "no auth token is found";
      throw error;
    }

    await authToken.populate("owner").execPopulate();

    if (!authToken.owner) {
      const error = new Error();
      error.name = "InconsistencyError";
      error.message = "unable to find a user for an existing token";
      throw error;
    }

    // TODO: isFrozen

    req.token = token;
    req.user = authToken.owner;

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError" || err.name === "JsonWebTokenError") {
      res.status(403).json({
        name: "AuthorizationError",
        message: "please, get an authentication"
      });
    } else {
      next(err);
    }

    // if (err.name === "TokenExpiredError") {
    //   res.status(403).json({
    //     name: "JsonWebTokenError",
    //     message: "please, get an authentication",
    //     code: "JWTE001"
    //   });

    //   if (Date.now() - Number(err.expiredAt) > refreshPeriod) {
    //     res.status(403).json({ name: "JsonWebTokenError", message: "please, get an authentication", code: "JWTE001" });
    //   } else {
    //     const decoded = jwt.verify(token, jwtSecret, {ignoreExpiration: true});

    //     req.user = decoded;

    //     const newToken = jwt.sign(
    //       {
    //         user: {
    //           _id: decoded._id
    //         }
    //       },
    //       jwtSecret,
    //       {
    //         expiresIn: Date.now() + expiresIn
    //       }
    //     );

    //     next();
    //   }
    // } else if (err.name === "JsonWebTokenError") {
    //   res.status(403).json({
    //     name: "JsonWebTokenError",
    //     message: "please, get an authentication",
    //     code: "JWTE001"
    //   });
    // } else {
    //   // TODO: send an email
    //   res.status(500).json(err);
    // }
  }
};
