import crypto from "crypto";

import { eq, sql } from "drizzle-orm";

import { db } from "@/server/db";
import { sentNotifications, type Json } from "@/server/db/schema";

export const sendNotification = async ({
  hashInput,
  data,
  send,
}: {
  hashInput: string;
  data: { [key: string]: Json | undefined };
  send: () => Promise<void>;
}): Promise<boolean> => {
  const notificationHash = crypto
    .createHash("sha256")
    .update(hashInput)
    .digest("hex");

  // Check if already sent (unique constraint on notification_hash)
  const [result] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(sentNotifications)
    .where(eq(sentNotifications.notification_hash, notificationHash));

  if (result && result.count > 0) {
    return false;
  }

  console.log(`🔔 Sending notification: ${notificationHash}`);
  await send();

  // Record after successful send — a crash here may cause a duplicate on next run,
  // but will never silently drop a notification.
  try {
    await db
      .insert(sentNotifications)
      .values({ notification_hash: notificationHash, data });
  } catch (error: unknown) {
    // Ignore duplicate key violation (23505) — notification was already recorded
    const pgError = error as { code?: string };
    if (pgError.code !== "23505") {
      // Log but don't throw — the notification was already delivered
      console.error(
        `Failed to record sent notification ${notificationHash}:`,
        error,
      );
    }
  }

  return true;
};
