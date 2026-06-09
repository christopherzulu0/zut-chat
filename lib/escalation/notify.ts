import type { Escalation } from "@/generated/prisma";
import { isGmailConfigured, sendGmailMail } from "@/lib/email/gmail";

function escalationInbox(): string | undefined {
  return process.env.ESCALATION_EMAIL ?? process.env.GMAIL_USER;
}

function ticketRef(ticket: Escalation): string {
  return ticket.id.slice(0, 8).toUpperCase();
}

function studentDetails(ticket: Escalation): string {
  return [
    ticket.userName && `Name: ${ticket.userName}`,
    ticket.userEmail && `Email: ${ticket.userEmail}`,
    `Clerk ID: ${ticket.contact}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export async function notifyEscalation(ticket: Escalation): Promise<void> {
  const inbox = escalationInbox();
  const ref = ticketRef(ticket);

  const body = [
    `New escalation ticket: ${ticket.id}`,
    `Reference: ${ref}`,
    `Channel: ${ticket.channel}`,
    `Status: ${ticket.status}`,
    ``,
    studentDetails(ticket),
    ``,
    ticket.summary,
  ].join("\n");

  const subject = `[ZUT Chatbot] Escalation ${ref}${ticket.userName ? ` — ${ticket.userName}` : ""}`;

  if (isGmailConfigured() && inbox) {
    try {
      const sent = await sendGmailMail({ to: inbox, subject, text: body });
      if (sent) return;
    } catch (e) {
      console.error("Gmail escalation notification failed:", e);
    }
  }

  console.info("[Escalation]", body);
}

export async function notifyEscalationResolved(
  ticket: Escalation,
  resolutionMessage?: string | null
): Promise<void> {
  if (!ticket.userEmail) {
    console.info(
      `[Escalation resolved] No student email for ticket ${ticket.id}`
    );
    return;
  }

  const ref = ticketRef(ticket);
  const greeting = ticket.userName ? `Hi ${ticket.userName},` : "Hi,";
  const resolution =
    resolutionMessage?.trim() ||
    "Your request has been reviewed and marked as resolved. If you still need help, please reply to this email or use the chatbot again.";

  const body = [
    greeting,
    ``,
    `Your ZUT Student Support request (reference ${ref}) has been resolved.`,
    ``,
    resolution,
    ``,
    `Original request:`,
    ticket.summary,
    ``,
    `— ZUT Student Support`,
  ].join("\n");

  const subject = `[ZUT] Your support request ${ref} has been resolved`;

  if (isGmailConfigured()) {
    try {
      const sent = await sendGmailMail({
        to: ticket.userEmail,
        subject,
        text: body,
      });
      if (sent) return;
    } catch (e) {
      console.error("Gmail resolution notification failed:", e);
    }
  }

  console.info("[Escalation resolved]", { to: ticket.userEmail, ref, body });
}
