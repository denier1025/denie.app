module.exports = (req, res, next) => {
  try {
    const accessRights = res.locals.accessRights;

    const receivedFields = Object.keys(req.body);

    let isAllowed;

    if (!res.locals.roleRights) {
      res.locals.roleRights = accessRights.rolesRights[0];
    }

    if (res.locals.roleRights.allowedToReceive.length && !receivedFields.length) {
      return res
        .status(400)
        .send({ name: "StructureError", code: "EMPTY_BODY_NOT_ALLOWED" });
    }

    isAllowed = receivedFields.every(receivedField =>
      res.locals.roleRights.allowedToReceive.includes(receivedField)
    );

    if (!isAllowed) {
      return res
        .status(400)
        .send({ name: "StructureError", code: "INVALID_BODY_STRUCTURE" });
    }

    next();
  } catch (err) {
    next(err);
  }
};
