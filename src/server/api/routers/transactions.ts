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
    
    if (!data) {
      return [];
    }

    // TODO: Avalanche rpc node doesn't support trace_transaction
    const withoutAvalanche = data.filter(tx => tx.chain_id !== 43114);
    return withoutAvalanche;
  }),
  getAll: publicProcedure.query(async ({ ctx }) => {
    const { data } = await ctx.supabaseAdmin
      .from("TransactionForwardingAttempted")
      .select("*");

    if (!data) {
      return [];
    }
    const uniqueTransactionHash = new Set();

    const uniqueData = data.filter((item) => {
      if (uniqueTransactionHash.has(item.transaction_hash)) {
        return false;
      } else {
        uniqueTransactionHash.add(item.transaction_hash);
        return true;
      }
    });

    return uniqueData;
  }),
  get: publicProcedure.input(z.string()).query(async ({ input, ctx }) => {
    const { data } = await ctx.supabaseAdmin
      .from("TransactionForwardingAttempted")
      .select("*")
      .eq("transaction_hash", input);

    return data;
  }),
  checkMultiEnvelope: publicProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      const { data } = await ctx.supabaseAdmin
        .from("EnvelopeRegistered")
        .select("*")
        .eq("transaction_hash", input);

      return (data?.length ?? 0) > 1;
    }),
});
