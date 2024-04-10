import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { formatEther } from "viem";

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
          const costTimestamp = new Date(cost.timestamp as string).getTime();

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
          native: formatEther(BigInt(twoWeeksNative)) + " " + nativeSymbol,
          link: formatEther(BigInt(twoWeeksLink)) + " link",
        };
      }
    }),
});
