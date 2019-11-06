const config = require("config")
const transporter = require("../../settings/transporter");

module.exports = async err => {
  const mailOptions = {
    from: `"ERROR_500@denie.app" <${config.get("dev_email")}>`,
    to: config.get("dev_email"),
    subject: "Internal Server Error",
    text: err
  };

  await transporter.sendMail(mailOptions);
};
