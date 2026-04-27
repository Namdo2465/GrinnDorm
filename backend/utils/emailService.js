const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

async function sendVerificationEmail(toEmail, code) {
  try {
    const result = await transporter.sendMail({
      from: `"GrinnDorm" <${process.env.SMTP_EMAIL}>`,
      to: toEmail,
      subject: "GrinnDorm Verification Code",
      html: `
        <h2>Welcome to GrinnDorm!</h2>
        <p>Your verification code is:</p>
        <h1 style="font-size: 2rem; font-weight: bold; letter-spacing: 2px;">${code}</h1>
        <p>This code expires in 10 minutes.</p>
        <p>Do not share this code with anyone.</p>
      `,
    });

    console.log(`Email sent to ${toEmail}:`, result.response);
    return true;
  } catch (err) {
    console.error(`Error sending email to ${toEmail}:`, err);
    return false;
  }
}

module.exports = { sendVerificationEmail };
