const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.sendVerificationEmail = async (email, code) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Verify Your Email',
    html: `<p>Your verification code is: <strong>${code}</strong></p>`
  };

  await transporter.sendMail(mailOptions);
};

exports.sendResetCode = async (email, code) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset Code',
    html: `<p>Your password reset code is: <strong>${code}</strong></p>`
  };

  await transporter.sendMail(mailOptions);
};