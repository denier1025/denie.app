const config = require("config")
const transporter = require("../../settings/transporter");

module.exports = async (req, emailConfirmationToken) => {
  const mailOptions = {
    from: `"noreply@denie.app" <${config.get("dev_email")}>`,
    to: req.user.email.address,
    subject: "Email Confirmation Token",
    html: `<h4>Hello! Please, confirm your email by clicking the link: <a href='${
      process.env.NODE_ENV === "production" ? "https" : "http"
    }://${req.headers.host}/api/confirmation/email/${
      emailConfirmationToken.token
    }'>Confirmation link</a></h4>`
  };

  await transporter.sendMail(mailOptions);
};
