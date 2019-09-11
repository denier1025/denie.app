module.exports = err => {
  if (typeof err === "object") {
    const errorKeys = Object.keys(err.errors);
    const messages = [];
    errorKeys.forEach(errorKey => {
      messages.push({
        [errorKey]: err.errors[errorKey].message
      });
    });

    return messages;
  } else {
    return err.message;
  }
};
