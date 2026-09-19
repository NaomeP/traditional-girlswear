import nodemailer from "nodemailer";
console.log("Email service:", sendPasswordResetEmail);
export async function sendPasswordResetEmail(
  recipientEmail: string,
  resetLink: string,
): Promise<void> {
  const gmailUser = process.env.GMAIL_USER;
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailAppPassword) {
    throw new Error("Email service configuration is missing");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: gmailUser,
      pass: gmailAppPassword,
    },
  });

  await transporter.sendMail({
    from: `"Traditional Girlswear" <${gmailUser}>`,
    to: recipientEmail,
    subject: "Reset Your Traditional Girlswear Password",
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Password Reset Request</h2>

        <p>Hello,</p>

        <p>
          We received a request to reset your Traditional Girlswear password.
        </p>

        <p>
          Click the button below to create a new password:
        </p>

        <a
          href="${resetLink}"
          style="
            display: inline-block;
            padding: 12px 20px;
            background-color: #b8860b;
            color: white;
            text-decoration: none;
            border-radius: 5px;
          "
        >
          Reset Password
        </a>

        <p>
          This link will expire in 15 minutes.
        </p>

        <p>
          If you did not request this, you can ignore this email.
        </p>

        <p>Thank you,<br />Traditional Girlswear Team</p>
      </div>
    `,
  });
}