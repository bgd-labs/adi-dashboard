import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { type Hash } from "viem";
import { decodeEnvelopeMessage } from "@/server/utils/decodeEnvelopeMessage";

export const envelopesRouter = createTRPCRouter({
  get: publicProcedure
    .input(z.object({ envelopeId: z.string() }))
    .query(async ({ input, ctx }) => {
      const { envelopeId } = input;
      const { data: envelope } = await ctx.supabaseAdmin
        .from("Envelopes")
        .select(
          `*, TransactionReceived(chain_id, transaction_id), EnvelopeDeliveryAttempted(chain_id, is_delivered), TransactionForwardingAttempted(chain_id, adapter_successful, timestamp)`,
        )
        .eq("id", envelopeId)
        .maybeSingle();

      if (!envelope) {
        throw new Error("Envelope not found");
      }

      const messageData = Buffer.from(
        envelope.message!.slice(2),
        "hex",
      ).toString("utf8") as Hash;

      const isDelivered =
        envelope.origin_chain_id === envelope.destination_chain_id
          ? envelope.TransactionForwardingAttempted.some(
              (event) => event.adapter_successful === true,
            )
          : envelope.EnvelopeDeliveryAttempted.some(
              (event) => event.is_delivered === true,
            );

      const registeredAt = new Date(envelope.registered_at!);
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);

      const isPending = registeredAt > oneHourAgo && !isDelivered;

      const decodedMessage = decodeEnvelopeMessage(
        envelope.origin!,
        messageData,
      );

      const envelopeWithDecodedMessage = {
        ...envelope,
        isDelivered,
        isPending,
        message: messageData,
        decodedMessage,
      };

      return envelopeWithDecodedMessage;
    }),
  getAll: publicProcedure
    .input(
      z.object({
        page: z.number().int().positive(),
        pageSize: z.number().int().positive(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { page, pageSize } = input;
      const startIndex = (page - 1) * pageSize;

      const { data, error, count } = await ctx.supabaseAdmin
        .from("Envelopes")
        .select(
          `*, TransactionReceived(chain_id, transaction_id), EnvelopeDeliveryAttempted(chain_id, is_delivered), TransactionForwardingAttempted(chain_id, adapter_successful, timestamp)`,
          { count: "exact" },
        )
        .range(startIndex, startIndex + pageSize - 1)
        .order("registered_at", { ascending: false });

      if (startIndex >= (count ?? 0) || !data) {
        return { data: [], count: count ?? 0 };
      }

      const envelopeWithDeliveryInfo = data.map((envelope) => {
        const forwardingAttemptsGroupedByTimestamp =
          envelope.TransactionForwardingAttempted.reduce(
            (acc: Record<string, number>, curr) => {
              const timestamp = curr.timestamp;
              if (!timestamp) return acc;

              if (!acc[timestamp]) {
                acc[timestamp] = 0;
              }
              acc[timestamp]++;
              return acc;
            },
            {},
          );

        const firstKey = Object.keys(forwardingAttemptsGroupedByTimestamp)[0];
        const confirmationsTotal =
          firstKey !== undefined
            ? forwardingAttemptsGroupedByTimestamp[firstKey]
            : 0;

        const envelopeConsensus = {
          skip: envelope.destination_chain_id === envelope.origin_chain_id,
          is_reached: envelope.EnvelopeDeliveryAttempted.length > 0,
          confirmations_total: confirmationsTotal,
        };

        const transactionReceivedGroupedByTxId =
          envelope.TransactionReceived.reduce(
            (acc: Record<string, number>, curr) => {
              const transactionId = curr.transaction_id;
              if (!transactionId) return acc;

              if (!acc[transactionId]) {
                acc[transactionId] = 0;
              }
              acc[transactionId]++;
              return acc;
            },
            {},
          );

        const maxConfirmationCount =
          Object.values(transactionReceivedGroupedByTxId).length > 0
            ? Math.max(...Object.values(transactionReceivedGroupedByTxId))
            : 0;

        const envelopeConfirmations = maxConfirmationCount;

        const isDelivered =
          envelope.origin_chain_id === envelope.destination_chain_id
            ? envelope.TransactionForwardingAttempted.some(
                (event) => event.adapter_successful === true,
              )
            : envelope.EnvelopeDeliveryAttempted.some(
                (event) => event.is_delivered === true,
              );

        const registeredAt = new Date(envelope.registered_at!);
        const oneHourAgo = new Date();
        oneHourAgo.setHours(oneHourAgo.getHours() - 1);

        const isPending = registeredAt > oneHourAgo && !isDelivered;

        const messageData = Buffer.from(
          envelope.message!.slice(2),
          "hex",
        ).toString("utf8") as Hash;

        const decodedMessage = decodeEnvelopeMessage(
          envelope.origin!,
          messageData,
        );

        return {
          ...envelope,
          message: messageData,
          decodedMessage,
          is_delivered: isDelivered,
          is_pending: isPending,
          confirmations: envelopeConfirmations,
          consensus: envelopeConsensus,
        };
      });

      if (error) {
        throw error;
      }

      return { data: envelopeWithDeliveryInfo, count: count ?? 0 };
    }),
});
