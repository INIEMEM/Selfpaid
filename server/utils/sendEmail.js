const dns = require("dns").promises;
const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_SERVER,
      port: Number(process.env.MAIL_PORT),
      secure: process.env.MAIL_SECURE === "true" || process.env.MAIL_PORT === "465",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"SelfPaid" <${process.env.MAIL_USER}>`,
      to: options.to || options.email, // Support both formats
      subject: options.subject,
      html: options.html || options.body, // Support both formats
      text: options.text || options.message, // Support both formats
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Mail sent successfully to ${mailOptions.to}: ${info.messageId}`);
    return 1;
  } catch (error) {
    console.error(`❌ Mail sending failed: ${error.message}`);
    return 0;
  }
};

module.exports = sendEmail;
