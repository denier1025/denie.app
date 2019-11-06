module.exports = allowedToReceive => {
  return (req, res, next) => {
    try {
      if (allowedToReceive.query.length) {
        const queryFields = Object.keys(req.query);

        const isAllowed = queryFields.every(queryField =>
          allowedToReceive.query.includes(queryField)
        );

        if (!isAllowed) {
          return res
            .status(400)
            .send({ name: "StructureError", code: "INVALID_QUERY_STRUCTURE" });
        }
      }

      if (allowedToReceive.body.length) {
        const bodyFields = Object.keys(req.body);

        if (!bodyFields.length) {
          return res
            .status(400)
            .send({ name: "StructureError", code: "EMPTY_BODY_NOT_ALLOWED" });
        }

        const isAllowed = bodyFields.every(bodyField =>
          allowedToReceive.body.includes(bodyField)
        );

        if (!isAllowed) {
          return res
            .status(400)
            .send({ name: "StructureError", code: "INVALID_BODY_STRUCTURE" });
        }
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};
