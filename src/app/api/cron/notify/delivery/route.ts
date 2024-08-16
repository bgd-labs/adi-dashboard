import crypto from "crypto";
import { NextResponse } from "next/server";
import { type Hash } from "viem";
import * as chains from "viem/chains";

import { env } from "@/env";
import { supabaseAdmin } from "@/server/api/supabase";
import { decodeEnvelopeMessage } from "@/server/utils/decodeEnvelopeMessage";
import { msToTimeComponents } from "@/server/utils/msToTimeComponents";
import { sendSlackDeliveryWarning } from "@/server/utils/sendSlackDeliveryWarning";
import { timeComponentsToString } from "@/server/utils/timeComponentsToString";

const DELIVERY_NOTIFICATION_TIMEOUT = 1000 * 60 * 60;

export const GET = async (req: Request) => {
  if (req.headers.get("Authorization") !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: envelopes } = await supabaseAdmin
    .from("Envelopes")
    .select(
      "*, TransactionForwardingAttempted(adapter_successful, transaction_id, timestamp), EnvelopeDeliveryAttempted(is_delivered)",
    );

  if (!envelopes) {
    throw new Error("No envelopes found");
  }

  for (const envelope of envelopes) {
    const originChain = Object.values(chains).find(
      (chain) => chain.id === envelope.origin_chain_id,
    );
    const destinationChain = Object.values(chains).find(
      (chain) => chain.id === envelope.destination_chain_id,
    );

    const latestTransaction = envelope.TransactionForwardingAttempted.sort(
      (a, b) => (Number(b.timestamp) || 0) - (Number(a.timestamp) || 0),
    )[0];
    const txId = latestTransaction?.transaction_id;

    const messageData = Buffer.from(envelope.message!.slice(2), "hex").toString(
      "utf8",
    ) as Hash;

    const decodedMessage = decodeEnvelopeMessage(envelope.origin!, messageData);

    if (envelope.origin_chain_id === envelope.destination_chain_id) {
      const isDelivered = envelope.TransactionForwardingAttempted.some(
        (attempt) => attempt.adapter_successful,
      );

      if (!isDelivered) {
        const registeredAt = new Date(envelope.registered_at!);
        const now = new Date();
        const diff = now.getTime() - registeredAt.getTime();

        const notificationHash = crypto
          .createHash("sha256")
          .update(`${envelope.id}-${txId ?? "unknown"}`)
          .digest("hex");

        if (diff > DELIVERY_NOTIFICATION_TIMEOUT) {
          const timeframe = timeComponentsToString(msToTimeComponents(diff));

          const { data: wasAlreadyNotified } = await supabaseAdmin
            .from("SentNotifications")
            .select("*")
            .eq("notification_hash", notificationHash)
            .single();

          if (!wasAlreadyNotified) {
            console.log(
              `🔔 Sending slack delivery notification: ${notificationHash}`,
            );

            await sendSlackDeliveryWarning({
              envelopeId: envelope.id,
              timeframe,
              notificationThreshold: timeComponentsToString(
                msToTimeComponents(DELIVERY_NOTIFICATION_TIMEOUT),
              ),
              chainFrom: originChain?.name ?? "Unknown",
              chainTo: destinationChain?.name ?? "Unknown",
              decodedMessage,
            });
            await supabaseAdmin.from("SentNotifications").insert([
              {
                notification_hash: notificationHash,
                data: {
                  type: "delivery",
                  envelope_id: envelope.id,
                  transaction_id: txId ?? "unknown",
                },
              },
            ]);
          }
        }
      }
    }

    if (envelope.origin_chain_id !== envelope.destination_chain_id) {
      const isDelivered = envelope.EnvelopeDeliveryAttempted.some(
        (attempt) => attempt.is_delivered,
      );
      if (!isDelivered) {
        const registeredAt = new Date(envelope.registered_at!);
        const now = new Date();
        const diff = now.getTime() - registeredAt.getTime();

        const notificationHash = crypto
          .createHash("sha256")
          .update(`${envelope.id}-${txId ?? "unknown"}`)
          .digest("hex");

        console.log(`Trying to send slack notification for ${envelope.id}`);
        console.log(`Notification hash: ${notificationHash}`);

        if (diff > DELIVERY_NOTIFICATION_TIMEOUT) {
          const timeframe = timeComponentsToString(msToTimeComponents(diff));

          const { data: wasAlreadyNotified } = await supabaseAdmin
            .from("SentNotifications")
            .select("*")
            .eq("notification_hash", notificationHash)
            .single();

          if (!wasAlreadyNotified) {
            await sendSlackDeliveryWarning({
              envelopeId: envelope.id,
              timeframe,
              notificationThreshold: timeComponentsToString(
                msToTimeComponents(DELIVERY_NOTIFICATION_TIMEOUT),
              ),
              chainFrom: originChain?.name ?? "Unknown",
              chainTo: destinationChain?.name ?? "Unknown",
              decodedMessage,
            });
            await supabaseAdmin.from("SentNotifications").insert([
              {
                notification_hash: notificationHash,
                data: {
                  type: "delivery",
                  envelope_id: envelope.id,
                  transaction_id: txId ?? "unknown",
                },
              },
            ]);
          }
        }
      }
    }
  }

  return NextResponse.json({ ok: true });
};
