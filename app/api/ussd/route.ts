import { NextRequest } from "next/server";
import { handleUssd } from "@/lib/ussd/handler";

function parseBody(body: string): Record<string, string> {
  const params: Record<string, string> = {};
  for (const pair of body.split("&")) {
    const [k, v] = pair.split("=");
    if (k) params[decodeURIComponent(k)] = decodeURIComponent(v ?? "");
  }
  return params;
}

export async function POST(req: NextRequest) {
  const secret = process.env.AT_USSD_WEBHOOK_SECRET;
  if (secret) {
    const header = req.headers.get("x-at-secret");
    if (header !== secret) {
      return new Response("Forbidden", { status: 403 });
    }
  }

  let sessionId = "";
  let phoneNumber = "";
  let serviceCode = "";
  let text = "";

  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const json = await req.json();
    sessionId = json.sessionId ?? "";
    phoneNumber = json.phoneNumber ?? "";
    serviceCode = json.serviceCode ?? "";
    text = json.text ?? "";
  } else {
    const raw = await req.text();
    const params = parseBody(raw);
    sessionId = params.sessionId ?? "";
    phoneNumber = params.phoneNumber ?? "";
    serviceCode = params.serviceCode ?? "";
    text = params.text ?? "";
  }

  const response = await handleUssd({
    sessionId,
    phoneNumber,
    serviceCode,
    text,
  });

  return new Response(response, {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
}
