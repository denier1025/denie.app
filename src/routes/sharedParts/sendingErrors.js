const nodemailer = require("nodemailer");

module.exports = async err => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  const mailOptions = {
    from: `"ERROR_500@denie.app" <${process.env.EMAIL}>`,
    to: process.env.EMAIL,
    subject: "Internal Server Error",
    text: err
  };

  await transporter.sendMail(mailOptions);
};
