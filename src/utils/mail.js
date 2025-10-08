import Mailgen from "mailgen";

const mailGenerator = new Mailgen({
  theme: "default",
  product: {
    name: process.env.APP_NAME || "My App",
    link: process.env.APP_URL || "https://example.com/",
  },
});

// Helper to generate both HTML & text
export const generateEmail = (mailgenContent) => {
  const emailHtml = mailGenerator.generate(mailgenContent);
  const emailText = mailGenerator.generatePlaintext(mailgenContent);
  return { emailHtml, emailText };
};

// Verification email template
export const emailVerificationMailgenContent = (username, otp) => ({
  body: {
    name: username,
    intro: "Welcome to My App! We're very excited to have you on board.",
    action: {
      instructions:
        "To get started, please confirm your email by clicking below:",
      button: {
        color: "#22BC66",
        text: "Confirm your account",
        link: `${process.env.APP_URL}/api/v1/auth/verify-email?otp=${otp}`,
      },
    },
    outro:
      "Need help or have questions? Just reply to this email—we’d love to help.",
  },
});

// Reset password email template
export const resetPasswordMailgenContent = (username, otp) => ({
  body: {
    name: username,
    intro:
      "You have received this email because a password reset request for your account was received.",
    action: {
      instructions: "Click the button below to reset your password:",
      button: {
        color: "#DC4D2F",
        text: "Reset your password",
        link: `${process.env.APP_URL}/api/v1/auth/reset-password?otp=${otp}`,
      },
    },
    outro:
      "If you did not request a password reset, please ignore this email. This link is valid for the next 15 minutes.",
  },
});

// Main template selector
export const generateEmailTemplate = (type, username, otp) => {
  let emailContent;

  if (type === "verifyEmail") {
    emailContent = emailVerificationMailgenContent(username, otp);
  } else if (type === "resetPassword") {
    emailContent = resetPasswordMailgenContent(username, otp);
  } else {
    throw new Error("Invalid email type");
  }

  return generateEmail(emailContent);
};

