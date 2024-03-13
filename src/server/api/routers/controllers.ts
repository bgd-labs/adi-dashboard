import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const controllersRouter = createTRPCRouter({
  getChains: publicProcedure
    .query(async ({ ctx }) => {
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
});
