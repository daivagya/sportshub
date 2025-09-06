import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.USER_EMAIL,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
  },
});

console.log(process.env.GOOGLE_CLIENT_ID);
console.log(process.env.GOOGLE_CLIENT_SECRET);
console.log(process.env.GOOGLE_REFRESH_TOKEN);
console.log(process.env.USER_EMAIL);

export async function sendOTPEmail(to: string, otp: string) {
  try {
    const info = await transporter.sendMail({
      from: `"Sportshub" <${process.env.USER_EMAIL}>`,
      to,
      subject: "Your one-time verification OTP Code",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Your OTP Code</h2>
          <p>Use the following OTP to complete your login/signup:</p>
          <h3 style="color: #4CAF50;">${otp}</h3>
          <p>This code will expire in <b>5 minutes</b>.</p>
        </div>
      `,
    });
    console.log("OTP email sent:", info.messageId);
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Failed to send OTP email");
  }
}