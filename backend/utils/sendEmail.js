const nodemailer = require('nodemailer');

const createTransporter = () => {
  if (!process.env.SMTP_EMAIL) {
    return null;
  }
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

const sendEmail = async (options) => {
  const transporter = createTransporter();
  if (!transporter) {
    console.log(`[Email skipped] To: ${options.email} | Subject: ${options.subject}`);
    return;
  }

  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL || process.env.SMTP_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  await transporter.sendMail(message);
};

const emailTemplates = {
  welcome: (name, verifyUrl) => `
    <h2>Welcome to RealP Estate, ${name}!</h2>
    <p>Please verify your email by clicking the link below:</p>
    <a href="${verifyUrl}">Verify Email</a>
  `,
  resetPassword: (name, resetUrl) => `
    <h2>Password Reset Request</h2>
    <p>Hi ${name}, click the link below to reset your password:</p>
    <a href="${resetUrl}">Reset Password</a>
    <p>This link expires in 10 minutes.</p>
  `,
  propertyApproved: (name, propertyTitle) => `
    <h2>Property Approved!</h2>
    <p>Hi ${name}, your property "${propertyTitle}" has been approved and is now live.</p>
  `,
  propertyInquiry: (name, propertyTitle, message) => `
    <h2>New Property Inquiry</h2>
    <p>Hi ${name}, you have a new inquiry for "${propertyTitle}":</p>
    <p>${message}</p>
  `,
  appointmentBooked: (name, propertyTitle, date, time) => `
    <h2>Appointment Booked</h2>
    <p>Hi ${name}, an appointment has been booked for "${propertyTitle}" on ${date} at ${time}.</p>
  `,
  paymentConfirmation: (name, amount, invoiceNumber) => `
    <h2>Payment Confirmation</h2>
    <p>Hi ${name}, your payment of $${amount} has been confirmed.</p>
    <p>Invoice: ${invoiceNumber}</p>
  `,
};

module.exports = { sendEmail, emailTemplates };
