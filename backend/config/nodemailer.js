import nodemailer from 'nodemailer';

/**
 * Create email transporter
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

/**
 * Send email
 */
export const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      attachments: options.attachments || [],
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('❌ Email sending error:', error);
    throw new Error('Failed to send email');
  }
};

/**
 * Verify email configuration
 */
export const verifyEmailConfig = () => {
  try {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
      console.warn('⚠️  Email not configured. Outgoing emails will not be sent.');
      return false;
    }
    const transporter = createTransporter();
    transporter.verify((err) => {
      if (err) {
        console.warn('⚠️  Email server verification failed:', err.message);
      } else {
        console.log('✅ Email server is ready to send messages');
      }
    });
    return true;
  } catch (error) {
    console.warn('⚠️  Email configuration error:', error.message);
    return false;
  }
};

export default { sendEmail, verifyEmailConfig };  