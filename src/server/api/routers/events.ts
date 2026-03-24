import { eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  envelopeDeliveryAttempted,
  envelopeRegistered,
  transactionForwardingAttempted,
  transactionReceived,
} from "@/server/db/schema";

export const eventsRouter = createTRPCRouter({
  getRegisteredEvents: publicProcedure
    .input(
      z.object({
        envelopeId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { envelopeId } = input;
      return await ctx.db
        .select()
        .from(envelopeRegistered)
        .where(eq(envelopeRegistered.envelope_id, envelopeId));
    }),
  getForwardingAttemptEvents: publicProcedure
    .input(
      z.object({
        envelopeId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { envelopeId } = input;
      return await ctx.db
        .select()
        .from(transactionForwardingAttempted)
        .where(eq(transactionForwardingAttempted.envelope_id, envelopeId));
    }),
  getTransactionReceivedEvents: publicProcedure
    .input(
      z.object({
        envelopeId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { envelopeId } = input;
      return await ctx.db
        .select()
        .from(transactionReceived)
        .where(eq(transactionReceived.envelope_id, envelopeId));
    }),
  getDeliveryAttemptEvents: publicProcedure
    .input(
      z.object({
        envelopeId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { envelopeId } = input;
      return await ctx.db
        .select()
        .from(envelopeDeliveryAttempted)
        .where(eq(envelopeDeliveryAttempted.envelope_id, envelopeId));
    }),
  getDeliveryConfirmedEvents: publicProcedure
    .input(
      z.object({
        envelopeId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { envelopeId } = input;
      return await ctx.db
        .select()
        .from(envelopeDeliveryAttempted)
        .where(eq(envelopeDeliveryAttempted.envelope_id, envelopeId));
    }),
});
