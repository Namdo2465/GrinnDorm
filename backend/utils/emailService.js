const nodemailer = require("nodemailer");

// Create email transporter (connection to Gmail)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // false for port 587, true for port 465
  requireTLS: true,
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Send verification code email
async function sendVerificationEmail(toEmail, code) {
  try {
    const mailOptions = {
      from: process.env.SMTP_EMAIL, // (My Gmail)
      to: toEmail, // (student's email)
      subject: "GrinnDorm Verification Code",
      html: `
        <h2>Welcome to GrinnDorm!</h2>
        <p>Your verification code is:</p>
        <h1 style="font-size: 2rem; font-weight: bold; letter-spacing: 2px;">${code}</h1>
        <p>This code expires in 10 minutes.</p>
        <p>Do not share this code with anyone.</p>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${toEmail}:`, result.response);
    return true;
  } catch (err) {
    console.error(`Error sending email to ${toEmail}:`, err);
    return false;
  }
}

module.exports = { sendVerificationEmail };
