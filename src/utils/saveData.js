const recFunc = (user, fieldParts, data) => {
  if (fieldParts.length !== 1) {
    const field = fieldParts.shift();
    recFunc(user[field], fieldParts, data);
  } else {
    user[fieldParts[0]] = data;
  }
};

const saveData = (user, fieldParts, data) => {
  recFunc(user, fieldParts, data);
};

module.exports = saveData;
