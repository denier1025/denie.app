const dotize = require("./dotize");

const sendData = (model, allowedToSend) => {
  if (allowedToSend.length) {
    if (model.forEach) {
      const resultArray = [];

      model.forEach(elem => {
        const dotNotationObject = dotize.convert(elem);

        const resultObject = {};

        for (let key in dotNotationObject) {
          if (allowedToSend.includes(key)) {
            resultObject[key] = dotNotationObject[key];
          }
        }

        resultArray.push(resultObject);
      });

      return resultArray;
    } else {
      const dotNotationObject = dotize.convert(model);

      const resultObject = {};

      for (let key in dotNotationObject) {
        if (allowedToSend.includes(key)) {
          resultObject[key] = dotNotationObject[key];
        }
      }

      return resultObject;
    }
  } else {
    return null;
  }
};

module.exports = sendData;
