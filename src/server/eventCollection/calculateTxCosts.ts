import { type Hash } from "viem";
import { Core, viem } from "@quicknode/sdk";
import { erc20EventsAbi } from "@/server/constants/erc20EventsAbi";
import { supabaseAdmin } from "@/server/api/supabase";
import { getErc20TokenInfo } from "@/server/utils/getErc20TokenInfo";
import { getNativeTokenInfo } from "@/server/utils/getNativeTokenInfo";
import { type Trace } from "./types";

const ERC_20_TRANSFER_TOPIC =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

export const calculateTxCosts = async (txHash: Hash, chainId: number) => {
  const { data: chainConfig } = await supabaseAdmin
    .from("CrossChainControllers")
    .select(
      "address, quicknode_rpc_url, native_token_name, native_token_symbol",
    )
    .eq("chain_id", chainId)
    .maybeSingle();

  if (!chainConfig?.address) {
    throw new Error(`No CCC address found for chain ${chainId}`);
  }
  if (!chainConfig?.quicknode_rpc_url) {
    throw new Error(`No quicknode endpoint found for chain ${chainId}`);
  }

  const core = new Core({
    endpointUrl: chainConfig.quicknode_rpc_url,
  });

  const transactionReceipt = await core.client.getTransactionReceipt({
    hash: txHash,
  });

  const block = await core.client.getBlock({
    blockNumber: transactionReceipt.blockNumber,
  });
  const blockDate = new Date(Number(block.timestamp) * 1000);
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

      const eventData = viem.decodeEventLog({
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


  const tracedTransactions = (await core.client.request<viem.RpcSchemaOverride>(
    {
      method: "trace_transaction",
      params: [txHash],
    },
  )) as Trace[];
  const nonNullValueTransactions = tracedTransactions.filter(
    (tx) => tx.action?.value !== "0x0",
  );

  const nativeTokenInfo = await getNativeTokenInfo(
    formattedBlockDate,
    chainConfig.native_token_name!,
    chainConfig.native_token_symbol!,
  );

  const gasUsed =
    transactionReceipt.effectiveGasPrice * transactionReceipt.gasUsed;
  const gasCostsUSD = (Number(gasUsed) / 1e18) * nativeTokenInfo.price;

  const nativeTokenTransfers = nonNullValueTransactions
    .map((tx) => {
      const value = BigInt(tx.action.value);
      return {
        from: tx.action.from,
        to: tx.action.to,
        value: value.toString(),
        ...nativeTokenInfo,
      };
    })
    .filter((tx) => tx.from === chainConfig.address.toLowerCase())
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
      },
    ]);
    const transactionCostsWrite = await supabaseAdmin.from("TransactionCosts").upsert([
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
        };
      }),
    ]);
  } catch (error) {
    throw new Error(
      `Error upserting transaction costs for ${txHash} on chain ${chainId}`,
    );
  }
};
