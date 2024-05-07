import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { formatEther, formatGwei } from "viem";
import { truncateToTwoSignificantDigits } from "@/utils/truncateToTwoSignificantDigits";

const CHAIN_ID_TO_CURRENCY: Record<number, string> = {
  1: "ETH",
  137: "MATIC",
  43114: "AVAX",
};

export const controllersRouter = createTRPCRouter({
  getChains: publicProcedure.query(async ({ ctx }) => {
    const { data } = await ctx.supabaseAdmin
      .from("CrossChainControllers")
      .select("chain_id, chain_name_alias")
      .order("chain_id", { ascending: true });

    return data ?? [];
  }),
  getRetries: publicProcedure
    .input(
      z.object({
        chainId: z.number(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { data: retries } = await ctx.supabaseAdmin
        .from("Retries")
        .select("*")
        .eq("chain_id", input.chainId);

      return retries ?? [];
    }),
  getBurnRates: publicProcedure
    .input(
      z.object({
        chainId: z.number(),
        address: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { data: costs } = await ctx.supabaseAdmin
        .from("TransactionCosts")
        .select("*")
        .eq("chain_id", input.chainId)
        .ilike("from", input.address);

      if (costs) {
        const twoWeeksAgo = Date.now() - 2 * 7 * 24 * 60 * 60 * 1000;
        let twoWeeksLink = 0n;
        let twoWeeksNative = 0n;
        const nativeSymbol = CHAIN_ID_TO_CURRENCY[input.chainId];

        for (const cost of costs) {
          const costTimestamp = new Date(cost.timestamp!).getTime();

          if (costTimestamp >= twoWeeksAgo) {
            if (cost.token_address) {
              twoWeeksLink += BigInt(cost.value!);
            }
            if (cost.token_address === null) {
              twoWeeksNative += BigInt(cost.value!);
            }
          }
        }

        return {
          address: input.address,
          chainId: input.chainId,
          native:
            truncateToTwoSignificantDigits(
              formatEther(BigInt(twoWeeksNative)),
            ) +
            " " +
            nativeSymbol,
          link:
            truncateToTwoSignificantDigits(formatEther(BigInt(twoWeeksLink))) +
            " link",
        };
      }
    }),
  getBridgingStats: publicProcedure
    .input(
      z.object({
        chainId: z.number(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const twoWeeksAgo = Date.now() - 2 * 7 * 24 * 60 * 60 * 1000;

      const { count: bridgingEventsCount } = await ctx.supabaseAdmin
        .from("TransactionForwardingAttempted")
        .select("transaction_hash", { count: "exact" })
        .eq("chain_id", input.chainId)
        .gte("timestamp", new Date(twoWeeksAgo).toISOString());

      const { count: envelopesCount } = await ctx.supabaseAdmin
        .from("EnvelopeRegistered")
        .select("transaction_hash", { count: "exact" })
        .eq("chain_id", input.chainId)
        .gte("timestamp", new Date(twoWeeksAgo).toISOString());

      const { data: costs, count } = await ctx.supabaseAdmin
        .from("TransactionGasCosts")
        .select("gas_price", { count: "exact" })
        .eq("chain_id", input.chainId)
        .gte("timestamp", new Date(twoWeeksAgo).toISOString());

      let averageGasPrice = "N/A";
      if (count) {
        const totalGasPrice = costs.reduce(
          (total, cost) => total + (cost.gas_price ?? 0),
          0,
        );
        const avgPrice = totalGasPrice / count;

        averageGasPrice = `${truncateToTwoSignificantDigits(
          formatGwei(BigInt(avgPrice.toFixed(0))),
        )} gwei`;
      }

      return {
        chainId: input.chainId,
        numberOfBridgingEvents: bridgingEventsCount,
        numberOfEnvelopes: envelopesCount,
        averageGasPrice,
      };
    }),
});
