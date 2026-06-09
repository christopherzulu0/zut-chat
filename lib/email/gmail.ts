import nodemailer from "nodemailer";

export function isGmailConfigured(): boolean {
  return Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
}

function getFromAddress(): string {
  const user = process.env.GMAIL_USER!;
  const name = process.env.GMAIL_FROM_NAME ?? "ZUT Student Support";
  return `"${name}" <${user}>`;
}

export async function sendGmailMail(options: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<boolean> {
  if (!isGmailConfigured()) {
    return false;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: getFromAddress(),
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  });

  return true;
}
