import { Alchemy, DebugTracerType, Network } from "alchemy-sdk";
import { createClient, decodeEventLog, type Hash, http } from "viem";
import { getBlock, getTransactionReceipt } from "viem/actions";
import { avalanche, mainnet, polygon } from "viem/chains";

import { env } from "@/env";
import { supabaseAdmin } from "@/server/api/supabase";
import { erc20EventsAbi } from "@/server/constants/erc20EventsAbi";
import { getErc20TokenInfo } from "@/server/utils/getErc20TokenInfo";
import { getNativeTokenInfo } from "@/server/utils/getNativeTokenInfo";

type CallObject = {
  from: string;
  gas: string;
  gasUsed: string;
  to: string;
  input: string;
  output?: string;
  calls?: CallObject[];
  value?: string;
  type: string;
};

function findCallsWithValue(calls: CallObject[]): CallObject[] {
  const result: CallObject[] = [];

  function recurse(call: CallObject) {
    if (call.value && call.value !== "0x0") {
      result.push(call);
    }

    if (call.calls && call.calls.length > 0) {
      call.calls.forEach(recurse);
    }
  }

  calls.forEach(recurse);
  return result;
}

function getChain(chainId: number) {
  switch (chainId) {
    case mainnet.id:
      return mainnet;
    case polygon.id:
      return polygon;
    case avalanche.id:
      return avalanche;
    default:
      return mainnet;
  }
}

function getAlchemyNetwork(chainId: number) {
  switch (chainId) {
    case mainnet.id:
      return Network.ETH_MAINNET;
    case polygon.id:
      return Network.MATIC_MAINNET;
    case avalanche.id:
      return Network.AVAX_MAINNET;
    default:
      return Network.ETH_MAINNET;
  }
}

const ERC_20_TRANSFER_TOPIC =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

export const calculateTxCosts = async (txHash: Hash, chainId: number) => {
  const { data: chainConfig } = await supabaseAdmin
    .from("CrossChainControllers")
    .select(
      "address, analytics_rpc_url, native_token_name, native_token_symbol",
    )
    .eq("chain_id", chainId)
    .maybeSingle();

  if (!chainConfig?.address) {
    throw new Error(`No CCC address found for chain ${chainId}`);
  }
  if (!chainConfig?.analytics_rpc_url) {
    throw new Error(`No analytics endpoint found for chain ${chainId}`);
  }

  const batchConfig = { multicall: true } as const;
  const httpConfig = { timeout: 30_000, batch: true } as const;

  const client = createClient({
    batch: batchConfig,
    chain: getChain(chainId),
    transport: http(chainConfig.analytics_rpc_url, httpConfig),
  });

  const transactionReceipt = await getTransactionReceipt(client, {
    hash: txHash,
  });

  const block = await getBlock(client, {
    blockNumber: transactionReceipt.blockNumber,
  });

  const blockDate = new Date(Number(block.timestamp) * 1000);
  const dateString = blockDate.toISOString();

  const formattedBlockDate = [
    blockDate.getDate().toString().padStart(2, "0"),
    (blockDate.getMonth() + 1).toString().padStart(2, "0"),
    blockDate.getFullYear(),
  ].join("-");

  const erc20TransferEvents = transactionReceipt.logs.filter(
    (log: { topics: string[] }) => log.topics.includes(ERC_20_TRANSFER_TOPIC),
  );

  const erc20transfers = await Promise.all(
    erc20TransferEvents.map(async (event) => {
      const { address: tokenAddress } = event;

      const eventData = decodeEventLog({
        abi: erc20EventsAbi,
        data: event.data,
        topics: event.topics,
      }) as unknown as {
        args: {
          tokenAddress: string;
          name: string;
          symbol: string;
          value: string;
          price: string;
          from: string;
          to: string;
        };
      };

      const tokeninfo = await getErc20TokenInfo(
        tokenAddress,
        formattedBlockDate,
        chainId,
      );

      return {
        tokenAddress,
        from: eventData.args.from,
        to: eventData.args.to,
        value: eventData.args.value,
        logIndex: event.logIndex,
        ...tokeninfo,
      };
    }),
  );

  const config = {
    apiKey: env.ALCHEMY_API_KEY,
    network: getAlchemyNetwork(chainId),
    connectionInfoOverrides: {
      skipFetchSetup: true,
    },
  };

  const alchemy = new Alchemy(config);

  const tracedTransaction = await alchemy.debug.traceTransaction(
    txHash,
    {
      type: DebugTracerType.CALL_TRACER,
      onlyTopCall: false,
    },
    "5s",
  );

  const { calls } = tracedTransaction;
  const nonNullValueCalls = findCallsWithValue(calls ?? []);

  const nativeTokenInfo = await getNativeTokenInfo(
    formattedBlockDate,
    chainConfig.native_token_name!,
    chainConfig.native_token_symbol!,
  );

  const gasUsed =
    transactionReceipt.effectiveGasPrice * transactionReceipt.gasUsed;
  const gasCostsUSD = (Number(gasUsed) / 1e18) * nativeTokenInfo.price;

  const nativeTokenTransfers = nonNullValueCalls
    .map((call) => {
      const value = BigInt(call.value!);
      return {
        from: call.from,
        to: call.to,
        value: value.toString(),
        ...nativeTokenInfo,
      };
    })
    .filter((call) => call.from === chainConfig.address.toLowerCase())
    .map((tx, i) => {
      return {
        ...tx,
        // Simulate logIndex to use as unique identifier
        logIndex: i,
      };
    });

  try {
    await supabaseAdmin.from("TransactionGasCosts").upsert([
      {
        transaction_hash: txHash,
        chain_id: chainId,
        gas_price: Number(transactionReceipt.effectiveGasPrice),
        transaction_fee: Number(gasUsed),
        transaction_fee_usd: gasCostsUSD,
        token_usd_price: nativeTokenInfo.price,
        token_name: nativeTokenInfo.name,
        token_symbol: nativeTokenInfo.symbol,
        timestamp: dateString,
      },
    ]);
    await supabaseAdmin.from("TransactionCosts").upsert([
      ...erc20transfers.map((transfer) => {
        const usdValue = (Number(transfer.value) / 1e18) * transfer.price;

        return {
          transaction_hash: txHash,
          chain_id: chainId,
          token_address: transfer.tokenAddress,
          from: transfer.from,
          to: transfer.to,
          log_index: transfer.logIndex,
          value: Number(transfer.value),
          value_usd: usdValue,
          token_usd_price: transfer.price,
          token_name: transfer.name,
          token_symbol: transfer.symbol,
          timestamp: dateString,
        };
      }),
      ...nativeTokenTransfers.map((transfer) => {
        const usdValue = (Number(transfer.value) / 1e18) * transfer.price;
        return {
          transaction_hash: txHash,
          chain_id: chainId,
          from: transfer.from,
          to: transfer.to,
          log_index: transfer.logIndex,
          value: Number(transfer.value),
          value_usd: usdValue,
          token_usd_price: transfer.price,
          token_name: transfer.name,
          token_symbol: transfer.symbol,
          timestamp: dateString,
        };
      }),
    ]);
  } catch (error) {
    throw new Error(
      `Error upserting transaction costs for ${txHash} on chain ${chainId}`,
    );
  }
};
