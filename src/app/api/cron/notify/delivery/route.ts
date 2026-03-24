import { NextResponse } from "next/server";
import { type Hash } from "viem";
import * as chains from "viem/chains";

import { env } from "@/env";
import { supabaseAdmin } from "@/server/api/supabase";
import { decodeEnvelopeMessage } from "@/server/utils/decodeEnvelopeMessage";
import { msToTimeComponents } from "@/server/utils/msToTimeComponents";
import { sendNotification } from "@/server/utils/sendNotification";
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

    const isSameChain =
      envelope.origin_chain_id === envelope.destination_chain_id;
    const isDelivered = isSameChain
      ? envelope.TransactionForwardingAttempted.some(
          (attempt) => attempt.adapter_successful,
        )
      : envelope.EnvelopeDeliveryAttempted.some(
          (attempt) => attempt.is_delivered,
        );

    if (isDelivered) continue;

    const registeredAt = new Date(envelope.registered_at!);
    const diff = Date.now() - registeredAt.getTime();

    if (diff <= DELIVERY_NOTIFICATION_TIMEOUT) continue;

    const timeframe = timeComponentsToString(msToTimeComponents(diff));

    await sendNotification({
      hashInput: `${envelope.id}-${txId ?? "unknown"}`,
      data: {
        type: "delivery",
        envelope_id: envelope.id,
        transaction_id: txId ?? "unknown",
      },
      send: () =>
        sendSlackDeliveryWarning({
          envelopeId: envelope.id,
          timeframe,
          notificationThreshold: timeComponentsToString(
            msToTimeComponents(DELIVERY_NOTIFICATION_TIMEOUT),
          ),
          chainFrom: originChain?.name ?? "Unknown",
          chainTo: destinationChain?.name ?? "Unknown",
          decodedMessage,
        }),
    });
  }

  return NextResponse.json({ ok: true });
};
