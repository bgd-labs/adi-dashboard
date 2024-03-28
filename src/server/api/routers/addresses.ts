import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { getClient } from "@/server/eventCollection/getClient";
import { getContract, type Hex } from "viem";

const ADAPTER_ABI = [
  {
    inputs: [],
    name: "adapterName",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

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

      if (!data) {
        try {
          console.log("Address not found", address, chainId);
          const client = await getClient({ chainId });

          const contract = getContract({
            client,
            address: address as Hex,
            abi: ADAPTER_ABI,
          });
          if (!contract.read.adapterName) {
            console.log("Contract does not have adapterName method", address);
            return "";
          }

          const result = await contract.read.adapterName();

          await ctx.supabaseAdmin.from("AddressBook").upsert([
            {
              address: address,
              chain_id: chainId,
              name: result as string,
            },
          ]);

          return result;
        } catch (err) {
          console.log("Error fetching contract name", address, chainId);

          await ctx.supabaseAdmin.from("AddressBook").upsert([
            {
              address: address,
              chain_id: chainId,
              name: "Unknown",
            },
          ]);

          return "";
        }
      }

      return data?.name;
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
