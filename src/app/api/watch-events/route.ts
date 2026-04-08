import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import { parseSessionCookieValue } from "@/lib/auth/cookies";
import { LEAD_COOKIE_NAME } from "@/lib/auth/constants";
import { getSubtopicById, recordWatchEvent } from "@/lib/funnel/repository";

const watchEventSchema = z.object({
  subtopicId: z.string().trim().min(1),
  sessionId: z.string().trim().min(1),
  watchedSeconds: z.coerce.number().int().positive().max(300),
  positionSeconds: z.coerce.number().int().nonnegative().max(7200),
});

export async function POST(request: NextRequest) {
  const leadId = parseSessionCookieValue(request.cookies.get(LEAD_COOKIE_NAME)?.value, "lead");
  if (!leadId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = watchEventSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid watch event" }, { status: 400 });
  }

  const subtopic = await getSubtopicById(parsed.data.subtopicId);
  if (!subtopic) {
    return NextResponse.json({ error: "Unknown lesson" }, { status: 404 });
  }

  try {
    await recordWatchEvent({
      leadId,
      subtopicId: parsed.data.subtopicId,
      sessionId: parsed.data.sessionId,
      watchedSeconds: parsed.data.watchedSeconds,
      positionSeconds: parsed.data.positionSeconds,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to save the watch event.",
      },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true });
}
