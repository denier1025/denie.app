const nodemailer = require("nodemailer");

module.exports = async (req, user, emailConfirmationToken) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
      const mailOptions = {
        from: `"noreply@denie.app" <${process.env.EMAIL}>`,
        to: req.user.email.address,
        subject: "Email Confirmation Token",
        html: `<h4>Hello! Please, confirm your email by clicking the link: <a href='${
          process.env.NODE_ENV === "production" ? "https" : "http"
        }://${req.headers.host}/api/confirmation/email/${emailConfirmationToken.token}'>Confirmation link</a></h4>`
      };

      await transporter.sendMail(mailOptions);
}