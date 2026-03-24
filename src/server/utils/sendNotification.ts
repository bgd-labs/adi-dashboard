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

  // Atomic claim: insert returns nothing if row already exists (unique constraint on notification_hash)
  const { data: inserted, error } = await supabaseAdmin
    .from("SentNotifications")
    .insert({ notification_hash: notificationHash, data })
    .select()
    .maybeSingle();

  if (error) {
    // Unique constraint violation → already notified, skip
    if (error.code === "23505") {
      return false;
    }
    throw error;
  }

  if (!inserted) {
    return false;
  }

  try {
    console.log(`🔔 Sending notification: ${notificationHash}`);
    await send();
  } catch (error) {
    // Roll back the claim so next run can retry
    await supabaseAdmin
      .from("SentNotifications")
      .delete()
      .eq("notification_hash", notificationHash);
    throw error;
  }

  return true;
};
