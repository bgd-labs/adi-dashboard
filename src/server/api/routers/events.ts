import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const eventsRouter = createTRPCRouter({
  getRegisteredEvents: publicProcedure
    .input(
      z.object({
        envelopeId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { envelopeId } = input;
      const { data } = await ctx.supabaseAdmin
        .from("EnvelopeRegistered")
        .select("*")
        .eq("envelope_id", envelopeId);

      return data ?? [];
    }),
  getForwardingAttemptEvents: publicProcedure
    .input(
      z.object({
        envelopeId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { envelopeId } = input;
      const { data } = await ctx.supabaseAdmin
        .from("TransactionForwardingAttempted")
        .select("*")
        .eq("envelope_id", envelopeId);

      return data ?? [];
    }),
  getTransactionReceivedEvents: publicProcedure
    .input(
      z.object({
        envelopeId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { envelopeId } = input;
      const { data } = await ctx.supabaseAdmin
        .from("TransactionReceived")
        .select("*")
        .eq("envelope_id", envelopeId);

      return data ?? [];
    }),
  getDeliveryAttemptEvents: publicProcedure
    .input(
      z.object({
        envelopeId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { envelopeId } = input;
      const { data } = await ctx.supabaseAdmin
        .from("EnvelopeDeliveryAttempted")
        .select("*")
        .eq("envelope_id", envelopeId);

      return data ?? [];
    }),
  getDeliveryConfirmedEvents: publicProcedure
    .input(
      z.object({
        envelopeId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { envelopeId } = input;
      const { data } = await ctx.supabaseAdmin
        .from("EnvelopeDeliveryAttempted")
        .select("*")
        .eq("envelope_id", envelopeId);

      return data ?? [];
    }),
});
