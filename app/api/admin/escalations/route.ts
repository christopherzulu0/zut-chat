import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { isDbConfigured } from "@/lib/db/client";
import { getEscalations } from "@/lib/db/queries";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  if (!isDbConfigured()) {
    return NextResponse.json({ escalations: [] });
  }

  const escalations = await getEscalations();
  return NextResponse.json({ escalations });
}
