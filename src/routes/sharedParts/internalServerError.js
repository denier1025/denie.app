const nodemailer = require("nodemailer");

module.exports = async err => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: mailUsername,
          pass: mailPassword
        }
      });
      const mailOptions = {
        from: `"ERROR_500@denie.app" <${noreplyEmail}>`,
        to: noreplyEmail,
        subject: "Internal Server Error",
        text: err
      };

      await transporter.sendMail(mailOptions);

      res.status(500).json({
        name: "InternalServerError",
        message: "admin already notified about this error"
      });
}