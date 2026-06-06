import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { isDbConfigured } from "@/lib/db/client";
import { getEscalationCounts, getEscalations } from "@/lib/db/queries";

const statusSchema = z.enum(["open", "in_progress", "resolved", "all"]);

export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  if (!isDbConfigured()) {
    return NextResponse.json({
      escalations: [],
      counts: { open: 0, in_progress: 0, resolved: 0, total: 0 },
    });
  }

  const statusParam = req.nextUrl.searchParams.get("status") ?? "all";
  const parsed = statusSchema.safeParse(statusParam);
  const status = parsed.success && parsed.data !== "all" ? parsed.data : undefined;

  const [escalations, counts] = await Promise.all([
    getEscalations({ status, limit: 100 }),
    getEscalationCounts(),
  ]);

  return NextResponse.json({ escalations, counts });
}
