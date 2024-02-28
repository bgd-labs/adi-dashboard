import { supabaseAdmin } from "@/server/api/supabase/server";
import { ScanChart } from "../../components/ScanChart";
import { getClients } from "@/server/eventCollection/getClients";
import { getCrossChainControllers } from "@/server/eventCollection/getCrossChainControllers";
import { prepareBlockIntervals } from "@/server/eventCollection/prepareBlockIntervals";
import { type RangeStatus } from "@/server/eventCollection/types";
import { type Hash, formatEther } from "viem";

const CHAIN_IDS_FOR_BALANCE_RETRIEVAL = [1, 137, 43114];

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

      const { data: retries } = await supabaseAdmin
        .from("Retries")
        .select("*")
        .eq("chain_id", crossChainController.chain_id);

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
      if (!CHAIN_IDS_FOR_BALANCE_RETRIEVAL.includes(crossChainController.chain_id))
        return null;

      const client = clients[crossChainController.chain_id];
      if (!client) return null;

      const balance = await client.getBalance({
        address: crossChainController.address as Hash,
      });
      return { chain_id: crossChainController.chain_id, balance };
    },
  );

  const balanceArray = await Promise.all(balancePromises);

  const chainIdToCurrency: Record<number, string> = {
    1: 'ETH',
    137: 'MATIC',
    43114: 'AVAX',
  };
  
  const balances: Record<number, string> = balanceArray.reduce(
    (acc: Record<number, string>, item) => {
      if (item) {
        const formattedBalance = formatEther(item.balance);
        const currency = chainIdToCurrency[item.chain_id] ?? '';
        acc[item.chain_id] = `${formattedBalance} ${currency}`.trim();
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
