import nodemailer from "nodemailer";
import { generateEmailTemplate } from "./mail.js";

let transporter = null;

function createTransporter() {
  if (transporter) return transporter;

  const host = process.env.MAIL_TRAP_HOST || process.env.SMTP_HOST;
  const port = Number(
    process.env.MAIL_TRAP_PORT || process.env.SMTP_PORT || 587,
  );
  const user = process.env.MAIL_TRAP_USER || process.env.SMTP_USER;
  const pass = process.env.MAIL_TRAP_PASSWORD || process.env.SMTP_PASS;
  const secure = port === 465;

  if (!host || !user || !pass) {
    // In development you might allow missing creds, but fail loudly in production
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "SMTP credentials are not configured (MAIL_TRAP_* or SMTP_* required)",
      );
    }
  }

  // transporter = nodemailer.createTransport({
  //   host: host || "localhost",
  //   port,
  //   secure,
  //   auth: user && pass ? { user, pass } : undefined,
  //   pool: true,
  //   maxConnections: 5,
  //   greetingTimeout: 30000,
  // });

  // Looking to send emails in production? Check out our Email API/SMTP product!
  transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "8ba430fa94a795",
      pass: "1289c52609077d",
    },
  });

  return transporter;
}

export async function sendEmail({ to, subject, html, text }) {
  const t = createTransporter();
  const info = await t.sendMail({
    from: `"${process.env.APP_NAME || "My App"}" <${process.env.MAIL_TRAP_USER || process.env.SMTP_USER || "no-reply@example.com"}>`,
    to,
    subject,
    text,
    html,
  });
  return info;
}

export async function verifyEmailTransport() {
  const t = createTransporter();
  return t.verify();
}

export async function sendVerificationEmail({ user, rawToken }) {
  const verifyUrl = `${process.env.FRONTEND_URL || process.env.APP_URL || ""}/verify-email?token=${rawToken}&email=${encodeURIComponent(user.email)}`;
  const { emailHtml, emailText } = generateEmailTemplate(
    "verifyEmail",
    user.username,
    verifyUrl,
  );
  return sendEmail({
    to: user.email,
    subject: "Verify your email",
    html: emailHtml,
    text: emailText,
  });
}
