module.exports = (target, data) => {
  (function combineData(target, data) {
    for (let i in data) {
      if (typeof data[i] === "object") combineData(target[i], data[i]);
      else target[i] = data[i];
    }
  })(target, data);
};
