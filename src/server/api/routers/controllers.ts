import { and, asc, eq, gte, ilike, sql } from "drizzle-orm";
import { type Address, formatEther, formatGwei, getContract } from "viem";
import { z } from "zod";

import { env } from "@/env";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  crossChainControllers,
  envelopeRegistered,
  retries,
  transactionCosts,
  transactionForwardingAttempted,
  transactionGasCosts,
} from "@/server/db/schema";
import { getClient } from "@/server/eventCollection/getClient";
import { truncateToTwoSignificantDigits } from "@/utils/truncateToTwoSignificantDigits";

const CHAIN_ID_TO_CURRENCY: Record<number, string> = {
  1: "ETH",
  137: "MATIC",
  43114: "AVAX",
};

function aggregateBridgeAdaptersNew(
  events:
    | {
        transaction_hash: string;
        bridge_adapter: string | null;
        destination_chain_id: number | null;
      }[]
    | null,
) {
  if (!events) return [];

  const adapterCounts = events.reduce(
    (acc, event) => {
      if (event.bridge_adapter && event.destination_chain_id) {
        const chainId = event.destination_chain_id.toString();
        if (!acc[chainId]) {
          acc[chainId] = {};
        }
        acc[chainId][event.bridge_adapter] =
          (acc[chainId][event.bridge_adapter] || 0) + 1;
      }
      return acc;
    },
    {} as Record<string, Record<string, number>>,
  );

  return Object.entries(adapterCounts)
    .map(([chainId, adapters]) => ({
      chainId: parseInt(chainId),
      adapters: Object.entries(adapters)
        .map(([address, count]) => ({
          address,
          count,
        }))
        .sort((a, b) => b.count - a.count),
    }))
    .sort((a, b) => {
      const countA = a.adapters[0]?.count ?? 0;
      const countB = b.adapters[0]?.count ?? 0;
      return countB - countA;
    });
}

export const controllersRouter = createTRPCRouter({
  getChains: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db
      .select({
        chain_id: crossChainControllers.chain_id,
        chain_name_alias: crossChainControllers.chain_name_alias,
      })
      .from(crossChainControllers)
      .orderBy(asc(crossChainControllers.chain_id));
  }),
  getRetries: publicProcedure
    .input(
      z.object({
        chainId: z.number(),
      }),
    )
    .query(async ({ input, ctx }) => {
      return await ctx.db
        .select()
        .from(retries)
        .where(eq(retries.chain_id, input.chainId));
    }),
  getBurnRates: publicProcedure
    .input(
      z.object({
        chainId: z.number(),
        address: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const costs = await ctx.db
        .select()
        .from(transactionCosts)
        .where(
          and(
            eq(transactionCosts.chain_id, input.chainId),
            ilike(transactionCosts.from, input.address),
          ),
        );

      if (costs && costs.length > 0) {
        const twoWeeksAgo = Date.now() - 2 * 7 * 24 * 60 * 60 * 1000;
        let twoWeeksLink = 0n;
        let twoWeeksNative = 0n;
        const nativeSymbol = CHAIN_ID_TO_CURRENCY[input.chainId];

        for (const cost of costs) {
          const costTimestamp = new Date(cost.timestamp!).getTime();

          if (costTimestamp >= twoWeeksAgo) {
            if (cost.token_address) {
              twoWeeksLink += BigInt(cost.value ?? 0);
            } else {
              twoWeeksNative += BigInt(cost.value ?? 0);
            }
          }
        }

        const nativeValue = truncateToTwoSignificantDigits(
          formatEther(twoWeeksNative),
        );
        const linkValue = truncateToTwoSignificantDigits(
          formatEther(twoWeeksLink),
        );

        return {
          address: input.address,
          chainId: input.chainId,
          native: nativeValue === "0" ? "0" : `${nativeValue} ${nativeSymbol}`,
          link: linkValue === "0" ? "0" : `${linkValue} LINK`,
        };
      }

      return {
        address: input.address,
        chainId: input.chainId,
        native: "0",
        link: "0",
      };
    }),
  getBridgingStats: publicProcedure
    .input(
      z.object({
        chainId: z.number(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const twoWeeksAgo = Date.now() - 2 * 7 * 24 * 60 * 60 * 1000;
      const twoWeeksAgoISO = new Date(twoWeeksAgo).toISOString();

      const bridgingEvents = await ctx.db
        .select({
          transaction_hash: transactionForwardingAttempted.transaction_hash,
          bridge_adapter: transactionForwardingAttempted.bridge_adapter,
          destination_chain_id:
            transactionForwardingAttempted.destination_chain_id,
        })
        .from(transactionForwardingAttempted)
        .where(
          and(
            eq(transactionForwardingAttempted.chain_id, input.chainId),
            gte(transactionForwardingAttempted.timestamp, twoWeeksAgoISO),
          ),
        );

      const bridgingEventsCount = bridgingEvents.length;

      const [envelopesCountResult] = await ctx.db
        .select({ count: sql<number>`count(*)::int` })
        .from(envelopeRegistered)
        .where(
          and(
            eq(envelopeRegistered.chain_id, input.chainId),
            gte(envelopeRegistered.timestamp, twoWeeksAgoISO),
          ),
        );

      const envelopesCount = envelopesCountResult?.count ?? 0;

      const costs = await ctx.db
        .select({ gas_price: transactionGasCosts.gas_price })
        .from(transactionGasCosts)
        .where(
          and(
            eq(transactionGasCosts.chain_id, input.chainId),
            gte(transactionGasCosts.timestamp, twoWeeksAgoISO),
          ),
        );

      let averageGasPrice = "N/A";
      if (costs.length > 0) {
        const totalGasPrice = costs.reduce(
          (total, cost) => total + (cost.gas_price ?? 0),
          0,
        );
        const avgPrice = totalGasPrice / costs.length;

        averageGasPrice = `${truncateToTwoSignificantDigits(
          formatGwei(BigInt(avgPrice.toFixed(0))),
        )} gwei`;
      }

      const usageStats = aggregateBridgeAdaptersNew(bridgingEvents);

      return {
        chainId: input.chainId,
        numberOfBridgingEvents: bridgingEventsCount,
        numberOfEnvelopes: envelopesCount,
        averageGasPrice,
        usageStats,
      };
    }),
  getOptimalBandwidth: publicProcedure
    .input(
      z.object({
        from: z.number(),
        to: z.number(),
      }),
    )
    .query(async ({ input }) => {
      if (!input.from || !input.to) {
        return null;
      }

      const { client, crossChainController } = await getClient({
        chainId: input.from,
      });

      if (env.ENVIRONMENT_STAGE === "PREPROD") {
        return "-";
      }

      const contract = getContract({
        address: crossChainController.address as Address,
        abi: [
          {
            inputs: [
              {
                internalType: "uint256",
                name: "chainId",
                type: "uint256",
              },
            ],
            name: "getOptimalBandwidthByChain",
            outputs: [
              {
                internalType: "uint256",
                name: "",
                type: "uint256",
              },
            ],
            stateMutability: "view",
            type: "function",
          },
        ],
        client: client,
      });

      const optimalBandwidth = await contract.read.getOptimalBandwidthByChain([
        BigInt(input.to),
      ]);

      return Number(optimalBandwidth);
    }),
  getAvailableAdapters: publicProcedure
    .input(
      z.object({
        from: z.number(),
        to: z.number(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { client, crossChainController } = await getClient({
        chainId: input.from,
      });

      const contract = getContract({
        address: crossChainController.address as Address,
        abi: [
          {
            inputs: [
              {
                internalType: "uint256",
                name: "chainId",
                type: "uint256",
              },
            ],
            name: "getForwarderBridgeAdaptersByChain",
            outputs: [
              {
                components: [
                  {
                    internalType: "address",
                    name: "destinationBridgeAdapter",
                    type: "address",
                  },
                  {
                    internalType: "address",
                    name: "currentChainBridgeAdapter",
                    type: "address",
                  },
                ],
                internalType: "struct ChainIdBridgeConfig[]",
                name: "",
                type: "tuple[]",
              },
            ],
            stateMutability: "view",
            type: "function",
          },
        ],
        client: client,
      });

      const availableAdapters =
        await contract.read.getForwarderBridgeAdaptersByChain([
          BigInt(input.to),
        ]);

      return availableAdapters;
    }),
});
