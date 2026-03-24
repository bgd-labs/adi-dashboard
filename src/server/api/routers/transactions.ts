import { eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  envelopeRegistered,
  transactionCosts,
  transactionForwardingAttempted,
  transactionGasCosts,
} from "@/server/db/schema";

export const transactionsRouter = createTRPCRouter({
  getTransactionCosts: publicProcedure
    .input(
      z.object({
        txHashes: z.array(z.string()),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { txHashes } = input;
      if (txHashes.length === 0) return [];
      return await ctx.db
        .select()
        .from(transactionCosts)
        .where(inArray(transactionCosts.transaction_hash, txHashes));
    }),
  getGasCosts: publicProcedure
    .input(
      z.object({
        txHashes: z.array(z.string()),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { txHashes } = input;
      if (txHashes.length === 0) return [];
      return await ctx.db
        .select()
        .from(transactionGasCosts)
        .where(inArray(transactionGasCosts.transaction_hash, txHashes));
    }),
  getUnscannedTransactions: publicProcedure.query(async ({ ctx }) => {
    const data = await ctx.db.execute(
      sql`SELECT * FROM get_unscanned_transactions_sql()`,
    );

    if (!data.length) {
      return [];
    }

    // TODO: Avalanche rpc node doesn't support trace_transaction
    const withoutAvalanche = data.filter(
      (tx) => Number(tx.chain_id) !== 43114,
    );
    return withoutAvalanche;
  }),
  getAll: publicProcedure.query(async ({ ctx }) => {
    const data = await ctx.db
      .select()
      .from(transactionForwardingAttempted);

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
    return await ctx.db
      .select()
      .from(transactionForwardingAttempted)
      .where(eq(transactionForwardingAttempted.transaction_hash, input));
  }),
  checkMultiEnvelope: publicProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      const data = await ctx.db
        .select()
        .from(envelopeRegistered)
        .where(eq(envelopeRegistered.transaction_hash, input));

      return data.length > 1;
    }),
});
