import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const transactionsRouter = createTRPCRouter({
  getTransactionCosts: publicProcedure
    .input(
      z.object({
        txHashes: z.array(z.string()),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { txHashes } = input;
      const { data } = await ctx.supabaseAdmin
        .from("TransactionCosts")
        .select("*")
        .in("transaction_hash", txHashes);

      return data ?? [];
    }),
  getGasCosts: publicProcedure
    .input(
      z.object({
        txHashes: z.array(z.string()),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { txHashes } = input;
      const { data } = await ctx.supabaseAdmin
        .from("TransactionGasCosts")
        .select("*")
        .in("transaction_hash", txHashes);

      return data ?? [];
    }),
  getUnscannedTransactions: publicProcedure.query(async ({ ctx }) => {
    const { data } = await ctx.supabaseAdmin.rpc(
      "get_unscanned_transactions_sql",
    );

    return data;
  }),
});
