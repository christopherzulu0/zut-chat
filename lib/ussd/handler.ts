import { CATEGORY_QUERIES } from "@/lib/rag/prompts";
import { runRagQuery, truncateForUssd } from "@/lib/rag/chain";
import {
  getUssdSession,
  upsertUssdSession,
  deleteUssdSession,
  createEscalation,
  logQuery,
} from "@/lib/db/queries";
import { notifyEscalation } from "@/lib/escalation/notify";
import { hashQuery } from "@/lib/guest-session";
import { MAIN_MENU, ASK_PROMPT, endMessage } from "./menus";
import { isDbConfigured } from "@/lib/db/client";

export type UssdInput = {
  sessionId: string;
  phoneNumber: string;
  serviceCode: string;
  text: string;
};

const MENU_MAP: Record<string, { category: string; query: string }> = {
  "1": { category: "admissions", query: CATEGORY_QUERIES.admissions },
  "2": { category: "fees", query: CATEGORY_QUERIES.fees },
  "3": { category: "id", query: CATEGORY_QUERIES.id },
  "4": { category: "registration", query: CATEGORY_QUERIES.registration },
  "5": { category: "deadlines", query: CATEGORY_QUERIES.deadlines },
};

async function escalate(phoneNumber: string, summary: string) {
  if (isDbConfigured()) {
    const ticket = await createEscalation({
      contact: phoneNumber,
      summary,
      channel: "ussd",
    });
    await notifyEscalation(ticket);
    return endMessage(
      `Request sent. Ticket: ${ticket.id.slice(0, 8)}. Staff will contact you.`
    );
  }
  return endMessage("Request noted. Staff will contact you soon.");
}

async function answerRag(
  query: string,
  category?: string,
  phoneNumber?: string
): Promise<string> {
  try {
    const result = await runRagQuery(query, {
      category,
      maxTokens: 120,
    });
    if (isDbConfigured()) {
      await logQuery({
        channel: "ussd",
        queryHash: hashQuery(query),
        latencyMs: result.latencyMs,
        topScore: result.confidence / 100,
        escalated: result.shouldEscalate,
      });
    }
    if (result.shouldEscalate && phoneNumber) {
      return await escalate(phoneNumber, `USSD low-confidence: ${query}`);
    }
    const src = result.sources[0];
    const cite = src ? ` [${src.source}]` : "";
    return endMessage(truncateForUssd(result.answer + cite, 180));
  } catch {
    return endMessage(
      "Service unavailable. Dial again later or visit campus."
    );
  }
}

export async function handleUssd(input: UssdInput): Promise<string> {
  const { sessionId, phoneNumber, text } = input;
  const parts = text ? text.split("*") : [];
  const latest = parts[parts.length - 1] ?? "";

  if (latest === "0") {
    if (isDbConfigured()) await deleteUssdSession(sessionId);
    return await escalate(phoneNumber, "USSD user requested staff contact");
  }

  if (!text) {
    if (isDbConfigured()) {
      await upsertUssdSession({
        sessionId,
        step: "main",
        phoneNumber,
      });
    }
    return MAIN_MENU;
  }

  const session = isDbConfigured()
    ? await getUssdSession(sessionId)
    : null;
  const step = session?.step ?? "main";

  if (step === "main") {
    if (latest === "6") {
      if (isDbConfigured()) {
        await upsertUssdSession({
          sessionId,
          step: "ask",
          phoneNumber,
        });
      }
      return ASK_PROMPT;
    }
    const menu = MENU_MAP[latest];
    if (!menu) {
      return endMessage("Invalid option. Dial again.");
    }
    if (isDbConfigured()) await deleteUssdSession(sessionId);
    return await answerRag(menu.query, menu.category, phoneNumber);
  }

  if (step === "ask") {
    const question = latest.slice(0, 120);
    if (!question.trim()) {
      return endMessage("No question received. Dial again.");
    }
    if (isDbConfigured()) await deleteUssdSession(sessionId);
    return await answerRag(question, undefined, phoneNumber);
  }

  return MAIN_MENU;
}
