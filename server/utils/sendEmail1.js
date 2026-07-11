const { Resend } = require('resend');
const logger = require('./logger');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
  try {
    const result = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'SelfPaid <onboarding@resend.dev>',
      to,
      subject,
      html
    });
    logger.info('Email sent successfully: ' + result.data.id);
    return result;
  } catch (error) {
    logger.error('Email send failed: ' + error.message);
    throw error;
  }
};

module.exports = sendEmail;
