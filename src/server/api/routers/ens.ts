import { type Address } from "viem";
import { mainnet } from "viem/chains";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { getClient } from "@/server/eventCollection/getClient";
import { getAvatar, getName, hasENSDataExpired } from "@/utils/ensHelpers";

export const ensRouter = createTRPCRouter({
  get: publicProcedure
    .input(z.object({ walletAddress: z.string() }))
    .query(async ({ ctx, input }) => {
      // create viem client for mainnet rpc, to get ENS data
      const mainnetClient = await getClient({ chainId: mainnet.id });
      const lowercasedAddress =
        input.walletAddress.toLocaleLowerCase() as Address;
      // get data from db
      const dbData = await ctx.supabaseAdmin
        .from("ENS")
        .select("address, lastUpdated, name, avatar")
        .eq("address", input.walletAddress)
        .limit(1)
        .single();
      // check if data in db
      if (dbData?.data) {
        const data = dbData.data;
        // check TTL
        if (!hasENSDataExpired(data)) {
          // check if avatar exists
          if (!!data.avatar) {
            return {
              name: data.name,
              avatar: data.avatar,
            };
          } else {
            // check if ens name exists
            if (!!data.name) {
              return {
                name: data.name,
                avatar: null,
              };
              // if we have data in db, but don't have name and avatar and TTL has not yet passed
            } else {
              return {
                name: null,
                avatar: null,
              };
            }
          }
          // if we have data in db, but TTL expired, then we re-request all data from blockchain and update data in db (name and avatar)
        } else {
          const name = await getName(mainnetClient, lowercasedAddress);
          // check if ENS name exists for this input.walletAddress and then try to get avatar
          if (name) {
            const avatar = await getAvatar(mainnetClient, name);
            // update data in db
            await ctx.supabaseAdmin
              .from("ENS")
              .update({ lastUpdated: new Date(), name, avatar })
              .match({ address: input.walletAddress });
            return {
              name,
              avatar,
            };
            // if input.walletAddress don't have ENS name
          } else {
            // update data in db
            await ctx.supabaseAdmin
              .from("ENS")
              .update({ lastUpdated: new Date(), name })
              .match({ address: input.walletAddress });
            return {
              name: null,
              avatar: null,
            };
          }
        }
        // if we don't have data in db with input.walletAddress, then we request data from blockchain and set it to db
      } else {
        const name = await getName(mainnetClient, lowercasedAddress);
        // check if ENS name exists for this input.walletAddress and then try to get avatar
        if (name) {
          const avatar = await getAvatar(mainnetClient, name);
          // set data to db
          await ctx.supabaseAdmin.from("ENS").insert({
            address: input.walletAddress as Address,
            lastUpdated: new Date(),
            name,
            avatar,
          });
          return {
            name,
            avatar,
          };
          // if input.walletAddress don't have ENS name
        } else {
          // set data to db
          await ctx.supabaseAdmin.from("ENS").insert({
            address: input.walletAddress as Address,
            lastUpdated: new Date(),
            name,
          });
          return {
            name: null,
            avatar: null,
          };
        }
      }
    }),
});
