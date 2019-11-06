const accessRightsList = require("./accessRightsList");

module.exports = (path, method) => {
  const foundKey = Object.keys(accessRightsList).find(keyString => {
    return new RegExp(keyString).test(path);
  });

  let accessRights;

  if (!foundKey) {
    const error = new Error();
    error.name = "NotFoundError";
    error.code = "PATH_NOT_FOUND";
    throw error;
  } else {
    accessRights = accessRightsList[foundKey][method];
    if (!accessRights) {
      const error = new Error();
      error.name = "NotAllowedError";
      error.code = "METHOD_NOT_ALLOWED";
      throw error;
    }
  }

  return accessRights;
};