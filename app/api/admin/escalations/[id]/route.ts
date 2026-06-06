import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { isDbConfigured } from "@/lib/db/client";
import { updateEscalationStatus } from "@/lib/db/queries";

const bodySchema = z.object({
  status: z.enum(["open", "in_progress", "resolved"]),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  if (!isDbConfigured()) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 }
    );
  }

  const { id } = await params;
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  try {
    const escalation = await updateEscalationStatus(id, parsed.data.status);
    return NextResponse.json({ escalation });
  } catch {
    return NextResponse.json({ error: "Escalation not found" }, { status: 404 });
  }
}
