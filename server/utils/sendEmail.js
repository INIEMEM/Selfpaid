const sgMail = require("@sendgrid/mail");

const sendEmail = async ({ to, subject, html }) => {
  try {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
      to,
      from: process.env.FROM_EMAIL || "noreply@globaltaskplatform.com",
      subject,
      html,
    };

    await sgMail.send(msg);
    console.log(`Email sent successfully to ${to}`);
  } catch (error) {
    console.error("Error sending email:", error.response?.body || error.message);
    throw new Error("Email could not be sent");
  }
};

module.exports = sendEmail;
