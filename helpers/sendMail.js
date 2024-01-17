const nodemailer = require("nodemailer");

require("dotenv").config();
const { META_PASS } = process.env;

const config = {
  host: "smtp.meta.ua",
  port: 465,
  secure: true,
  auth: {
    user: "vidxll@meta.ua",
    pass: META_PASS,
  },
};

const transporter = nodemailer.createTransport(config);
const sendEmail = async (data) => {
  const mailOptions = {
    ...data,
    from: "vidxll@meta.ua",
  };

  transporter
    .sendMail(mailOptions)
    .then(() => console.log("Email sent successfully"))
    .catch((error) => console.log(error.message));
  return true;
};

module.exports = sendEmail;
