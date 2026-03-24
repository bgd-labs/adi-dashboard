import { and, eq, ilike } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { addressBook, bridgeExplorers } from "@/server/db/schema";

export const addressRouter = createTRPCRouter({
  get: publicProcedure
    .input(z.object({ address: z.string(), chainId: z.number() }))
    .query(async ({ input, ctx }) => {
      const { address, chainId } = input;

      const [data] = await ctx.db
        .select({ name: addressBook.name })
        .from(addressBook)
        .where(
          and(
            ilike(addressBook.address, address),
            eq(addressBook.chain_id, chainId),
          ),
        )
        .limit(1);

      return data?.name ?? "";
    }),
  getBridgeExplorerLink: publicProcedure
    .input(z.object({ address: z.string(), chainId: z.number() }))
    .query(async ({ input, ctx }) => {
      const { address, chainId } = input;

      const [data] = await ctx.db
        .select({ explorer_link: bridgeExplorers.explorer_link })
        .from(bridgeExplorers)
        .where(
          and(
            ilike(bridgeExplorers.address, address),
            eq(bridgeExplorers.chain_id, chainId),
          ),
        )
        .limit(1);

      return data?.explorer_link ?? "";
    }),
});
