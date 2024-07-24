import { NextResponse } from "next/server";

import { env } from "@/env";
import { retryEvents } from "@/server/eventCollection";

export const maxDuration = 200;

export const GET = async (req: Request) => {
  if (req.headers.get("Authorization") !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await retryEvents();

  return NextResponse.json({ ok: true });
};
