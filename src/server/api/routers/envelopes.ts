import { type Hash } from "viem";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { decodeEnvelopeMessage } from "@/server/utils/decodeEnvelopeMessage";
import { getEnvelopeConsensus } from "@/server/utils/getEnvelopeConsensus";

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

      let query = ctx.supabaseAdmin
        .from("Envelopes")
        .select(
          `*, TransactionReceived(chain_id, transaction_id), EnvelopeDeliveryAttempted(chain_id, is_delivered), TransactionForwardingAttempted(chain_id, adapter_successful, timestamp)`,
          { count: "exact" },
        )
        .range(startIndex, startIndex + pageSize - 1)
        .order("registered_at", { ascending: false });

      if (input.from) {
        query = query.filter("origin_chain_id", "eq", input.from);
      }

      if (input.to) {
        query = query.filter("destination_chain_id", "eq", input.to);
      }

      if (input.proposalId) {
        query = query.filter("proposal_id", "eq", input.proposalId);
      }

      if (input.payloadId) {
        query = query.filter("payload_id", "eq", input.payloadId);
      }

      const { data, error, count } = await query;

      if (startIndex >= (count ?? 0) || !data) {
        return { data: [], count: count ?? 0 };
      }

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

      if (error) {
        throw error;
      }

      return { data: envelopeWithDeliveryInfo, count: count ?? 0 };
    }),
  getAllSlugs: publicProcedure.query(async ({ ctx }) => {
    const envelopes = await ctx.supabaseAdmin.from("Envelopes").select("id");
    if (!envelopes.data) {
      return [];
    }
    return envelopes.data.map((envelope) => envelope.id);
  }),
});
