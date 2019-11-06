module.exports = (req, res, next) => {
  try {
    const accessRights = res.locals.accessRights;

    let roleRights

    if (accessRights.routeRights.isPrivate) {
      roleRights = accessRights.rolesRights.find(roleRights => roleRights.role === req.auth.role)

      if (!roleRights) {
        return res.status(403).send({ name: "AccessError", code: "MIS_ROLE" });
      }
    }

    res.locals.roleRights = roleRights

    next();
  } catch (err) {
    next(err);
  }
};
