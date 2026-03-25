import { and, desc, eq, sql } from "drizzle-orm";
import { type Hash } from "viem";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { envelopes } from "@/server/db/schema";
import { decodeEnvelopeMessage } from "@/server/utils/decodeEnvelopeMessage";
import { getEnvelopeConsensus } from "@/server/utils/getEnvelopeConsensus";

export const envelopesRouter = createTRPCRouter({
  get: publicProcedure
    .input(z.object({ envelopeId: z.string() }))
    .query(async ({ input, ctx }) => {
      const { envelopeId } = input;
      const envelope = await ctx.db.query.envelopes.findFirst({
        where: eq(envelopes.id, envelopeId),
        with: {
          TransactionReceived: {
            columns: { chain_id: true, transaction_id: true },
          },
          EnvelopeDeliveryAttempted: {
            columns: { chain_id: true, is_delivered: true },
          },
          TransactionForwardingAttempted: {
            columns: {
              chain_id: true,
              adapter_successful: true,
              timestamp: true,
            },
          },
        },
      });

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

      const envelopeConsensus = getEnvelopeConsensus(envelope);

      const envelopeWithDecodedMessage = {
        ...envelope,
        is_delivered: isDelivered,
        is_pending: isPending,
        message: messageData,
        decodedMessage,
        ...envelopeConsensus,
      };

      return envelopeWithDecodedMessage;
    }),
  getAll: publicProcedure
    .input(
      z.object({
        page: z.number().int().positive(),
        pageSize: z.number().int().positive(),
        from: z.string().optional(),
        to: z.string().optional(),
        proposalId: z.string().optional(),
        payloadId: z.string().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { page, pageSize } = input;
      const startIndex = (page - 1) * pageSize;

      const conditions = [
        input.from
          ? eq(envelopes.origin_chain_id, Number(input.from))
          : undefined,
        input.to
          ? eq(envelopes.destination_chain_id, Number(input.to))
          : undefined,
        input.proposalId
          ? eq(envelopes.proposal_id, Number(input.proposalId))
          : undefined,
        input.payloadId
          ? eq(envelopes.payload_id, Number(input.payloadId))
          : undefined,
      ].filter(Boolean);

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const [countResult] = await ctx.db
        .select({ count: sql<number>`count(*)::int` })
        .from(envelopes)
        .where(where);

      const count = countResult?.count ?? 0;

      if (startIndex >= count) {
        return { data: [], count };
      }

      const data = await ctx.db.query.envelopes.findMany({
        where,
        with: {
          TransactionReceived: {
            columns: { chain_id: true, transaction_id: true },
          },
          EnvelopeDeliveryAttempted: {
            columns: { chain_id: true, is_delivered: true },
          },
          TransactionForwardingAttempted: {
            columns: {
              chain_id: true,
              adapter_successful: true,
              timestamp: true,
            },
          },
        },
        orderBy: [desc(envelopes.registered_at)],
        limit: pageSize,
        offset: startIndex,
      });

      const envelopeWithDeliveryInfo = data.map((envelope) => {
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

        const envelopeConsensus = getEnvelopeConsensus(envelope);

        return {
          ...envelope,
          message: messageData,
          decodedMessage,
          is_delivered: isDelivered,
          is_pending: isPending,
          ...envelopeConsensus,
          payload_id: envelope.payload_id,
          proposal_id: envelope.proposal_id,
        };
      });

      return { data: envelopeWithDeliveryInfo, count };
    }),
  getAllSlugs: publicProcedure.query(async ({ ctx }) => {
    const data = await ctx.db.select({ id: envelopes.id }).from(envelopes);
    return data.map((envelope) => envelope.id);
  }),
});
