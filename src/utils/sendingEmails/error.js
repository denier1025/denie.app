const transporter = require("../../settings/transporter");

module.exports = async err => {
  const mailOptions = {
    from: `"ERROR_500@denie.app" <${process.env.DEV_EMAIL}>`,
    to: process.env.DEV_EMAIL,
    subject: "Internal Server Error",
    text: err
  };

  await transporter.sendMail(mailOptions);
};
