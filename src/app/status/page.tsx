import { api } from "@/trpc/server";
import { ScanChart } from "../../components/ScanChart";
import { getClients } from "@/server/eventCollection/getClients";
import { getCrossChainControllers } from "@/server/eventCollection/getCrossChainControllers";
import { prepareBlockIntervals } from "@/server/eventCollection/prepareBlockIntervals";
import { type RangeStatus } from "@/server/eventCollection/types";
import { type Hash, formatEther } from "viem";
import { getBalance } from "@/server/utils/getBalance";
import { truncateToTwoSignificantDigits } from "@/utils/truncateToTwoSignificantDigits";

const CHAIN_IDS_FOR_BALANCE_RETRIEVAL = [1, 137, 43114];
const CHAIN_ID_TO_CURRENCY: Record<number, string> = {
  1: "ETH",
  137: "MATIC",
  43114: "AVAX",
};

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

      return await getBalance({
        chainId: crossChainController.chain_id,
        address: crossChainController.address as Hash,
      });
    },
  );

  const balanceArray = await Promise.all(balancePromises);

  const balances: Record<number, { native: string; link: string }> =
    balanceArray.reduce(
      (acc: Record<number, { native: string; link: string }>, item) => {
        if (item) {
          const formattedBalance = truncateToTwoSignificantDigits(
            formatEther(item.balance),
          );
          const formattedLinkBalance = item.linkBalance
            ? truncateToTwoSignificantDigits(formatEther(item.linkBalance))
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

  const burnRates = (
    await Promise.all(
      crossChainControllers.map(async (crossChainController) => {
        if (
          !CHAIN_IDS_FOR_BALANCE_RETRIEVAL.includes(
            crossChainController.chain_id,
          )
        )
          return null;

        const burnRates = await api.controllers.getBurnRates({
          chainId: crossChainController.chain_id,
          address: crossChainController.address,
        });

        return burnRates;
      }),
    )
  ).filter((burnRate) => burnRate !== null);

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
          burnRate={burnRates.find(
            (rate) =>
              rate?.chainId === crossChainController.chain_id &&
              rate?.address === crossChainController.address,
          )}
        />
      ))}
    </>
  );
};

export default StatusPage;
export const revalidate = 1;
