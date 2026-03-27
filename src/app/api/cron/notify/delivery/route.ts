import { gt } from "drizzle-orm";
import { NextResponse } from "next/server";
import { type Hash } from "viem";
import * as chains from "viem/chains";

import { env } from "@/env";
import { db } from "@/server/db";
import { envelopes } from "@/server/db/schema";
import { decodeEnvelopeMessage } from "@/server/utils/decodeEnvelopeMessage";
import { msToTimeComponents } from "@/server/utils/msToTimeComponents";
import { sendNotification } from "@/server/utils/sendNotification";
import { sendSlackDeliveryWarning } from "@/server/utils/sendSlackDeliveryWarning";
import { timeComponentsToString } from "@/server/utils/timeComponentsToString";

const DELIVERY_NOTIFICATION_TIMEOUT = 1000 * 60 * 60;
const LOOKBACK_DAYS = 7;

export const GET = async (req: Request) => {
  if (req.headers.get("Authorization") !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const lookbackDate = new Date(
      Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000,
    ).toISOString();

    const envelopesList = await db.query.envelopes.findMany({
      where: gt(envelopes.registered_at, lookbackDate),
      with: {
        TransactionForwardingAttempted: {
          columns: {
            adapter_successful: true,
            transaction_id: true,
            timestamp: true,
          },
        },
        EnvelopeDeliveryAttempted: {
          columns: { is_delivered: true },
        },
      },
    });

    if (!envelopesList || envelopesList.length === 0) {
      return NextResponse.json({ ok: true, message: "No envelopes to check" });
    }

    const errors: Array<{ envelopeId: string; error: string }> = [];

    for (const envelope of envelopesList) {
      try {
        if (!envelope.message || !envelope.origin || !envelope.registered_at) {
          console.warn(
            `Skipping envelope ${envelope.id}: missing required fields`,
          );
          continue;
        }

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

        const decodedMessage = decodeEnvelopeMessage(
          envelope.origin,
          envelope.message as Hash,
        );

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

        const registeredAt = new Date(envelope.registered_at);
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
      } catch (error) {
        console.error(`Failed to process envelope ${envelope.id}:`, error);
        errors.push({
          envelopeId: envelope.id,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    if (errors.length > 0) {
      return NextResponse.json({ ok: false, errors }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delivery notification cron failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
};
