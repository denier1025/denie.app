const transporter = require("../../settings/transporter")

module.exports = async err => {
  const mailOptions = {
    from: `"ERROR_500@denie.app" <${process.env.EMAIL}>`,
    to: process.env.EMAIL,
    subject: "Internal Server Error",
    text: err
  };

  await transporter.sendMail(mailOptions);
};