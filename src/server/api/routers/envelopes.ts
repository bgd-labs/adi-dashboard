import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { type Hash } from "viem";
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
        query = query.filter("origin_chain_id", "eq", input.from);
      }

      if (input.to) {
        query = query.filter("destination_chain_id", "eq", input.to);
        query = query.filter("destination_chain_id", "eq", input.to);
      }

      if (input.proposalId) {
        query = query.filter("proposal_id", "eq", input.proposalId);
        query = query.filter("proposal_id", "eq", input.proposalId);
      }

      if (input.payloadId) {
        query = query.filter("payload_id", "eq", input.payloadId);
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
  getBridgingState: publicProcedure
    .input(z.object({ envelopeId: z.string() }))
    .query(async ({ input, ctx }) => {
      const SKIPPED_STATUS_TIMEOUT_HOURS = 10;

      const { envelopeId } = input;

      const { data: envelope } = await ctx.supabaseAdmin
        .from("Envelopes")
        .select(`origin_chain_id, destination_chain_id, registered_at`)
        .eq("id", envelopeId)
        .maybeSingle();

      if (!envelope) {
        throw new Error("Envelope not found");
      }

      const { data: forwardingAttemptEvents } = await ctx.supabaseAdmin
        .from("TransactionForwardingAttempted")
        .select("*")
        .eq("envelope_id", envelopeId);

      const { data: deliveryAttemptEvents } = await ctx.supabaseAdmin
        .from("EnvelopeDeliveryAttempted")
        .select("*")
        .eq("envelope_id", envelopeId);

      const isEnvelopeDelivered = deliveryAttemptEvents?.length;

      const { data: transactionReceivedEvents } = await ctx.supabaseAdmin
        .from("TransactionReceived")
        .select("*")
        .eq("envelope_id", envelopeId);

      if (!forwardingAttemptEvents) {
        return {
          origin: [],
          destination: [],
        };
      }

      const sortedEvents = [...forwardingAttemptEvents].sort(
        (a, b) => Number(b.timestamp) - Number(a.timestamp),
      );

      const uniqueForwardingAttemptEvents = sortedEvents.filter(
        (event, index, self) =>
          index ===
          self.findIndex((e) => e.bridge_adapter === event.bridge_adapter),
      );

      const originAdapters = uniqueForwardingAttemptEvents.map((event) => {
        return {
          chainId: event.chain_id,
          address: event.bridge_adapter,
          status: event.adapter_successful ? "success" : "failed",
        };
      });

      const destinationAdapters = uniqueForwardingAttemptEvents.map((event) => {
        const isSameChain =
          envelope.origin_chain_id === envelope.destination_chain_id;
        const isAdapterSuccessful = forwardingAttemptEvents.some(
          (e) => e.adapter_successful,
        );
        const isDestinationAdapterMatch =
          transactionReceivedEvents &&
          transactionReceivedEvents.some(
            (e) => e.bridge_adapter === event.destination_bridge_adapter,
          );

        let status = "failed";
        const registeredAt = new Date(envelope.registered_at!);
        const timeBeforeTimeout = new Date();
        timeBeforeTimeout.setHours(
          timeBeforeTimeout.getHours() - SKIPPED_STATUS_TIMEOUT_HOURS,
        );

        if (
          registeredAt > timeBeforeTimeout &&
          !isEnvelopeDelivered &&
          !isDestinationAdapterMatch &&
          !(isSameChain && isAdapterSuccessful)
        ) {
          status = "pending";
        } else if (isSameChain && isAdapterSuccessful) {
          status = "success";
        } else if (!isSameChain && isDestinationAdapterMatch) {
          status = "success";
        } else if (event.adapter_successful && isEnvelopeDelivered) {
          status = "skipped";
        }

        return {
          txChainId: event.chain_id,
          chainId: event.destination_chain_id,
          address: event.destination_bridge_adapter,
          encoded_transaction: event.encoded_transaction,
          status,
        };
      });

      const failedAdapters = destinationAdapters.filter(
        (adapter) => adapter.status === "failed",
      );

      const failedAdaptersWithNames = await Promise.all(
        failedAdapters.map(async (adapter) => {
          const { data } = await ctx.supabaseAdmin
            .from("AddressBook")
            .select("name")
            .ilike("address", adapter.address!)
            .eq("chain_id", adapter.chainId!)
            .limit(1)
            .single();

          const adapterName = data?.name;

          return {
            ...adapter,
            name: adapterName ?? "Unknown",
          };
        }),
      );

      return {
        origin: originAdapters,
        destination: destinationAdapters,
        failedAdapters: failedAdaptersWithNames,
      };
    }),
});
