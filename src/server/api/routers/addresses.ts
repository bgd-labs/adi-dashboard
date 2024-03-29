import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const addressRouter = createTRPCRouter({
  get: publicProcedure
    .input(z.object({ address: z.string(), chainId: z.number() }))
    .query(async ({ input, ctx }) => {
      const { address, chainId } = input;

      const { data } = await ctx.supabaseAdmin
        .from("AddressBook")
        .select("name")
        .ilike("address", address)
        .eq("chain_id", chainId)
        .limit(1)
        .single();

      return data?.name ?? "";
    }),
  getBridgeExplorerLink: publicProcedure
    .input(z.object({ address: z.string(), chainId: z.number() }))
    .query(async ({ input, ctx }) => {
      const { address, chainId } = input;

      const { data } = await ctx.supabaseAdmin
        .from("BridgeExplorers")
        .select("explorer_link")
        .ilike("address", address)
        .eq("chain_id", chainId)
        .limit(1)
        .single();

      return data?.explorer_link ?? "";
    }),
});
