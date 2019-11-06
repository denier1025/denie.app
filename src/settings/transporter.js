const config = require("config")
const nodemailer = require("nodemailer");

module.exports = nodemailer.createTransport({
  service: config.get("email_host"),
  auth: {
    user: config.get("email_user"),
    pass: config.get("email_pass")
  }
});
