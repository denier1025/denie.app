const roleTypes = require("../settings/roleTypes");

module.exports = (auth, profile, subordinationSettings, role) => {
  if (role && roleTypes[auth.role] <= roleTypes[role]) {
    const error = new Error();
    error.name = "AccessError";
    error.code = "YOU_ARE_THE_ENEMY!!!_ALERT!";
    throw error;
  }

  if (auth._id === profile._id && !subordinationSettings.self.modify) {
    const error = new Error();
    error.name = "AccessError";
    error.code = "MODIFY_YOURSELF_NOT_ALLOWED";
    throw error;
  }

  if (
    roleTypes[auth.role] > roleTypes[profile.role] &&
    !subordinationSettings.child.modify
  ) {
    const error = new Error();
    error.name = "AccessError";
    error.code = "MODIFY_LOW_ORDER_ROLE_NOT_ALLOWED";
    throw error;
  }

  if (
    roleTypes[auth.role] === roleTypes[profile.role] &&
    !subordinationSettings.sibling.modify
  ) {
    const error = new Error();
    error.name = "AccessError";
    error.code = "MODIFY_IDENTICAL_ROLE_NOT_ALLOWED";
    throw error;
  }

  if (
    roleTypes[auth.role] < roleTypes[profile.role] &&
    !subordinationSettings.parent.modify
  ) {
    const error = new Error();
    error.name = "AccessError";
    error.code = "MODIFY_HIGH_ORDER_ROLE_NOT_ALLOWED";
    throw error;
  }
};
