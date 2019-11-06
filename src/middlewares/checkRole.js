module.exports = roles => {
  return (req, res, next) => {
    try {
      const role = roles.find(role => res.locals.auth.role === role);

      if (!role) {
        return res.status(403).send({ name: "AccessError", code: "MIS_ROLE" });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};
