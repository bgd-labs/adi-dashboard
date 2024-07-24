import { NextResponse } from "next/server";

import { env } from "@/env";
import { collectEvents } from "@/server/eventCollection";

export const maxDuration = 200;

export const GET = async (req: Request) => {
  if (req.headers.get("Authorization") !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await collectEvents();

  return NextResponse.json({ ok: true });
};
