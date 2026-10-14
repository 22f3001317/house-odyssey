import nodemailer from "nodemailer";

// Any SMTP provider works (Gmail app password, Brevo, Resend SMTP, Mailgun...). Set SMTP_URL like smtps://user:pass@smtp.example.com:465
export const mailConfigured = () => !!process.env.SMTP_URL;
export const baseUrl = (req: Request) =>
  process.env.APP_URL?.replace(/\/$/, "") ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : new URL(req.url).origin);

export async function sendVerificationEmail(to: string, name: string, url: string) {
  const transport = nodemailer.createTransport(process.env.SMTP_URL!);
  const from = process.env.EMAIL_FROM ?? "House Odyssey <no-reply@localhost>";
  await transport.sendMail({
    from, to, subject: "Confirm your House Odyssey email",
    text: `Hi ${name},\n\nConfirm your email to finish signing up:\n${url}\n\nThis link works once and expires in 24 hours. If you didn't sign up, ignore this message.`,
    html: `<p>Hi ${name.replace(/[<>&]/g, "")},</p><p><a href="${url}">Confirm your email</a> to finish signing up.</p><p>This link works once and expires in 24 hours. If you didn't sign up, ignore this message.</p>`,
  });
}
