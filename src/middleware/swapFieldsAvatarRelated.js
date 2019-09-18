module.exports = async (req, res, next) => {
  try {
    req.body.buffer = Buffer.from(req.body.base64Data || "", "base64");

    next();
  } catch (err) {
    next(err);
  }
};

// {
//     base64Data: Sjd32932dfjAIj32df...
//     extension: 'png'
// }
