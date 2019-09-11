const sharp = require("sharp");

module.exports = async (req, res, next) => {
  if (!req.body.base64Data) {
    const error = new Error();
    error.name = "ValidationError";
    error.message = "no data received";
    throw error;
  }

  req.body.buffer = Buffer.from(req.body.base64Data, "base64");

  try {
    if (req.body.extension !== "gif") {
      req.body.buffer = await sharp(req.body.buffer)
        .resize({
          width: 150,
          height: 150,
          withoutEnlargement: true
        })
        .toBuffer();
    }

    next();
  } catch (err) {
    if (err.name === "ValidationError") {
      res.status(400).json(err);
    } else {
      next(err)
    }
  }
};

// {
//     base64Data: Sjd32932dfjAIj32df...
//     extension: 'png'
// }
