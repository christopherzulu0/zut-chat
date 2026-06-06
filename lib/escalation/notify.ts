import type { Escalation } from "@/generated/prisma";

export async function notifyEscalation(ticket: Escalation): Promise<void> {
  const email = process.env.ESCALATION_EMAIL;
  const studentLine = [
    ticket.userName && `Name: ${ticket.userName}`,
    ticket.userEmail && `Email: ${ticket.userEmail}`,
    `Clerk ID: ${ticket.contact}`,
  ]
    .filter(Boolean)
    .join("\n");

  const body = [
    `New escalation ticket: ${ticket.id}`,
    `Channel: ${ticket.channel}`,
    `Status: ${ticket.status}`,
    ``,
    studentLine,
    ``,
    ticket.summary,
  ].join("\n");

  if (process.env.RESEND_API_KEY && email) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "ZUT Chatbot <onboarding@resend.dev>",
          to: [email],
          subject: `[ZUT Chatbot] Escalation ${ticket.id.slice(0, 8)}${ticket.userName ? ` — ${ticket.userName}` : ""}`,
          text: body,
        }),
      });
      return;
    } catch (e) {
      console.error("Resend notification failed:", e);
    }
  }

  console.info("[Escalation]", body);
}
