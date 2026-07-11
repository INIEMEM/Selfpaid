const nodemailer = require("nodemailer");
const { Resend } = require("resend");

const sendEmail = async (options) => {
  let resp = 0;
  let resendSuccess = false;
  let smtpSuccess = false;

  // ✅ PRIMARY MAIL SERVICE — RESEND
  try {
    const resend = new Resend(process.env.RESEND_API);

    const send = await resend.emails.send({
      from: "Venire <justice@venireapp.com>",
      to: options.email,
      subject: options.subject,
      html: options.body,
      text: options.message,
    });

    if (send?.data) {
      console.log(`✅ Primary mail sent via Resend to ${options.email} with ID: ${send.data.id}`);
      resendSuccess = true;
    } else if (send?.error && Object.keys(send.error).length !== 0) {
      console.error(`❌ Resend mail failed: ${JSON.stringify(send.error)}`);
    }
  } catch (resendError) {
    console.error(`❌ Primary mail (Resend) error: ${resendError.message}`);
  }

  // 🔁 FALLBACK — SMTP (Nodemailer)
  if (!resendSuccess) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.MAIL_SERVER,
        port: process.env.MAIL_PORT,
        secure: process.env.MAIL_SECURE === "true",
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      });

      const message = {
        from: `Venire <justice@venireapp.com>`,
        to: options.email,
        subject: options.subject,
        html: options.body,
        text: options.message,
      };

      const info = await transporter.sendMail(message);
      console.log(`✅ Fallback mail sent via SMTP to ${options.email}: ${info.messageId}`);
      smtpSuccess = true;
    } catch (smtpError) {
      console.error(`❌ Fallback mail (SMTP) failed: ${smtpError.message}`);
    }
  }

  resp = resendSuccess || smtpSuccess ? 1 : 0;

  return resp;
};

module.exports = sendEmail;
