import crypto from "crypto";

import { type Json } from "@/server/api/database.types";
import { supabaseAdmin } from "@/server/api/supabase";

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
  const { count } = await supabaseAdmin
    .from("SentNotifications")
    .select("*", { count: "exact", head: true })
    .eq("notification_hash", notificationHash);

  if (count && count > 0) {
    return false;
  }

  console.log(`🔔 Sending notification: ${notificationHash}`);
  await send();

  // Record after successful send — a crash here may cause a duplicate on next run,
  // but will never silently drop a notification.
  const { error } = await supabaseAdmin
    .from("SentNotifications")
    .insert({ notification_hash: notificationHash, data });

  if (error && error.code !== "23505") {
    // Log but don't throw — the notification was already delivered
    console.error(`Failed to record sent notification ${notificationHash}:`, error);
  }

  return true;
};
