import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const domain = process.env.NEXT_PUBLIC_APP_URL;

// Simple, branded email verification for SnipShare
export const sendVerificationEmail = async (
  email: string, 
  token: string
) => {
  const confirmLink = `${domain}/auth/new-verification?token=${token}`;

  await resend.emails.send({
    from: "no-reply@saiteja.us",
    to: email,
    subject: "Verify your SnipShare email",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify your email</title>
          <style>
            body {
              background: #f9fafb;
              color: #222;
              font-family: Arial, Helvetica, sans-serif;
              padding: 0;
              margin: 0;
            }
            .container {
              max-width: 400px;
              margin: 40px auto;
              background: #fff;
              border-radius: 8px;
              box-shadow: 0 2px 8px #e5e7eb;
              padding: 32px 24px;
              text-align: center;
            }
            .brand {
              font-size: 22px;
              font-weight: 700;
              color: #6366f1;
              margin-bottom: 18px;
            }
            .button {
              display: inline-block;
              background: #6366f1;
              color: #fff;
              padding: 12px 28px;
              border-radius: 6px;
              text-decoration: none;
              font-weight: 600;
              margin: 20px 0;
              font-size: 16px;
            }
            .link {
              font-size: 13px;
              color: #6366f1;
              word-break: break-all;
            }
            .footer {
              margin-top: 28px;
              font-size: 12px;
              color: #999;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="brand">SnipShare</div>
            <h2>Verify your email</h2>
            <p>Click the button below to confirm your email address and start sharing snippets.</p>
            <a href="${confirmLink}" class="button">Verify Email</a>
            <p>If the button doesn't work, copy and paste this link in your browser:</p>
            <div class="link">${confirmLink}</div>
            <div class="footer">
              This link expires in 24 hours.<br>
              If you didn't sign up, just ignore this email.
            </div>
          </div>
        </body>
      </html>
    `
  });
};

// Simple, branded password reset for SnipShare
export const sendPasswordResetEmail = async (
  email: string,
  token: string,
) => {
  const resetLink = `${domain}/auth/new-password?token=${token}`;

  await resend.emails.send({
    from: "no-reply@saiteja.us",
    to: email,
    subject: "Reset your SnipShare password",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset password</title>
          <style>
            body {
              background: #f9fafb;
              color: #222;
              font-family: Arial, Helvetica, sans-serif;
              padding: 0;
              margin: 0;
            }
            .container {
              max-width: 400px;
              margin: 40px auto;
              background: #fff;
              border-radius: 8px;
              box-shadow: 0 2px 8px #e5e7eb;
              padding: 32px 24px;
              text-align: center;
            }
            .brand {
              font-size: 22px;
              font-weight: 700;
              color: #6366f1;
              margin-bottom: 18px;
            }
            .button {
              display: inline-block;
              background: #6366f1;
              color: #fff;
              padding: 12px 28px;
              border-radius: 6px;
              text-decoration: none;
              font-weight: 600;
              margin: 20px 0;
              font-size: 16px;
            }
            .link {
              font-size: 13px;
              color: #6366f1;
              word-break: break-all;
            }
            .footer {
              margin-top: 28px;
              font-size: 12px;
              color: #999;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="brand">SnipShare</div>
            <h2>Reset your password</h2>
            <p>Click below to reset your password for SnipShare.</p>
            <a href="${resetLink}" class="button">Reset Password</a>
            <p>If the button doesn't work, copy and paste this link in your browser:</p>
            <div class="link">${resetLink}</div>
            <div class="footer">
              This link expires in 24 hours.<br>
              If you didn't request this, you can ignore this email.
            </div>
          </div>
        </body>
      </html>
    `
  });
};