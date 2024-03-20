import { api } from "@/trpc/server";
import { ScanChart } from "../../components/ScanChart";
import { getClients } from "@/server/eventCollection/getClients";
import { getCrossChainControllers } from "@/server/eventCollection/getCrossChainControllers";
import { prepareBlockIntervals } from "@/server/eventCollection/prepareBlockIntervals";
import { type RangeStatus } from "@/server/eventCollection/types";
import { type Hash, formatEther, getContract } from "viem";

const CHAIN_IDS_FOR_BALANCE_RETRIEVAL = [1, 137, 43114];
const CHAIN_ID_TO_CURRENCY: Record<number, string> = {
  1: "ETH",
  137: "MATIC",
  43114: "AVAX",
};
const CHAIN_ID_TO_LINK_CONTRACT: Record<number, string> = {
  1: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
  137: "0xb0897686c545045aFc77CF20eC7A532E3120E0F1",
  43114: "0x5947BB275c521040051D82396192181b413227A3",
};
const LINK_TOKEN_ABI = [
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
];

const StatusPage = async () => {
  const crossChainControllers = await getCrossChainControllers();
  const clients = await getClients({ crossChainControllers });

  const chainRanges = await Promise.all(
    crossChainControllers.map(async (crossChainController) => {
      const client = clients[crossChainController.chain_id];
      if (!client) return;

      const latestBlock = Number(await client.getBlockNumber());
      const lastScannedBlock = crossChainController.last_scanned_block!;
      const firstBlockInRange = crossChainController.created_block;

      const retries = await api.controllers.getRetries({
        chainId: crossChainController.chain_id,
      });

      const ranges = retries
        ? prepareBlockIntervals(
            firstBlockInRange,
            latestBlock,
            lastScannedBlock,
            retries,
          )
        : [];

      return {
        chain_id: crossChainController.chain_id,
        ranges,
      };
    }),
  );

  const balancePromises = crossChainControllers.map(
    async (crossChainController) => {
      if (
        !CHAIN_IDS_FOR_BALANCE_RETRIEVAL.includes(crossChainController.chain_id)
      )
        return null;

      const client = clients[crossChainController.chain_id];
      if (!client) return null;

      const linkContract = getContract({
        address: CHAIN_ID_TO_LINK_CONTRACT[
          crossChainController.chain_id
        ] as Hash,
        abi: LINK_TOKEN_ABI,
        client: client,
      });

      let linkBalance: bigint | null = null;

      if (linkContract?.read?.balanceOf) {
        linkBalance = (await linkContract.read.balanceOf([
          crossChainController.address as Hash,
        ])) as bigint;
      }

      const balance = await client.getBalance({
        address: crossChainController.address as Hash,
      });
      return { chain_id: crossChainController.chain_id, balance, linkBalance };
    },
  );

  const balanceArray = await Promise.all(balancePromises);

  const balances: Record<number, { native: string; link: string }> =
    balanceArray.reduce(
      (acc: Record<number, { native: string; link: string }>, item) => {
        if (item) {
          const formattedBalance = formatEther(item.balance);
          const formattedLinkBalance = item.linkBalance
            ? formatEther(item.linkBalance)
            : "-";
          const currency = CHAIN_ID_TO_CURRENCY[item.chain_id] ?? "";
          acc[item.chain_id] = {
            native: `${formattedBalance} ${currency}`.trim(),
            link: `${formattedLinkBalance} LINK`.trim(),
          };
        }
        return acc;
      },
      {},
    );

  const chainRangesObject: Record<number, RangeStatus[]> = chainRanges.reduce(
    (obj, item) => {
      if (item) {
        obj[item.chain_id] = item.ranges;
      }
      return obj;
    },
    {} as Record<number, RangeStatus[]>,
  );

  crossChainControllers.sort((a, b) => a.chain_id - b.chain_id);

  return (
    <>
      {crossChainControllers.map((crossChainController) => (
        <ScanChart
          key={crossChainController.chain_id}
          ranges={chainRangesObject[crossChainController.chain_id] ?? []}
          chainId={crossChainController.chain_id}
          title={clients[crossChainController.chain_id]?.chain.name}
          lastScannedBlock={crossChainController.last_scanned_block!}
          address={crossChainController.address}
          balance={balances[crossChainController.chain_id]}
        />
      ))}
    </>
  );
};

export const revalidate = 1;

export default StatusPage;
