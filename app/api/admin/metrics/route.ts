import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { isDbConfigured } from "@/lib/db/client";
import { getMetrics } from "@/lib/db/queries";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  if (!isDbConfigured()) {
    return NextResponse.json({
      stats: { totalQueries: 0, avgLatency: 0, escalationCount: 0 },
      recent: [],
    });
  }

  const metrics = await getMetrics();
  return NextResponse.json(metrics);
}
