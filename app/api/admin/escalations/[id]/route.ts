import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { isDbConfigured } from "@/lib/db/client";
import { updateEscalation } from "@/lib/db/queries";
import { notifyEscalationResolved } from "@/lib/escalation/notify";

const bodySchema = z.object({
  status: z.enum(["open", "in_progress", "resolved"]).optional(),
  adminNotes: z.string().max(5000).nullable().optional(),
  resolutionMessage: z.string().max(5000).nullable().optional(),
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
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { status, adminNotes, resolutionMessage } = parsed.data;
  if (
    status === undefined &&
    adminNotes === undefined &&
    resolutionMessage === undefined
  ) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  try {
    const escalation = await updateEscalation(id, {
      status,
      adminNotes,
      resolutionMessage,
    });

    if (status === "resolved") {
      await notifyEscalationResolved(
        escalation,
        resolutionMessage ?? escalation.resolutionMessage
      );
    }

    return NextResponse.json({ escalation });
  } catch {
    return NextResponse.json({ error: "Escalation not found" }, { status: 404 });
  }
}
