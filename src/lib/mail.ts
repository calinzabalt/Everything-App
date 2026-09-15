import { createTransport } from "nodemailer";

function requiredEnv(name: string) {
  const value = process.env[name]?.trim() ?? "";
  if (!value) {
    throw new Error(`${name} is not set.`);
  }
  return value;
}

export function getMailer() {
  const port = Number(process.env.BREVO_SMTP_PORT ?? "587");
  return createTransport({
    host: requiredEnv("BREVO_SMTP_HOST"),
    port,
    secure: port === 465,
    requireTLS: port === 587,
    auth: {
      user: requiredEnv("BREVO_SMTP_USER"),
      pass: requiredEnv("BREVO_SMTP_PASS"),
    },
  });
}

export async function sendOutreachEmail(input: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  const fromEmail = requiredEnv("CONTACT_FROM_EMAIL");
  const transporter = getMailer();
  await transporter.sendMail({
    from: `SIENA <${fromEmail}>`,
    to: input.to,
    replyTo: fromEmail,
    subject: input.subject,
    html: input.html,
    text: input.text,
  });
}
