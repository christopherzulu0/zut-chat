import type { Escalation } from "@/generated/prisma";

export async function notifyEscalation(ticket: Escalation): Promise<void> {
  const email = process.env.ESCALATION_EMAIL;
  const body = [
    `New escalation ticket: ${ticket.id}`,
    `Channel: ${ticket.channel}`,
    `Contact: ${ticket.contact}`,
    `Status: ${ticket.status}`,
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
          subject: `[ZUT Chatbot] Escalation ${ticket.id.slice(0, 8)}`,
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
