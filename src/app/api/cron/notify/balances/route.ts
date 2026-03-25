import { NextResponse } from "next/server";
import { formatEther, type Hash } from "viem";
import * as chains from "viem/chains";

import { env } from "@/env";
import { getCrossChainControllers } from "@/server/eventCollection/getCrossChainControllers";
import { getBalance } from "@/server/utils/getBalance";
import { sendNotification } from "@/server/utils/sendNotification";
import { sendSlackBalanceWarning } from "@/server/utils/sendSlackBalanceWarning";

const CHAIN_IDS_FOR_BALANCE_RETRIEVAL = [1, 137, 43114];
const CHAIN_ID_TO_CURRENCY: Record<number, string> = {
  1: "ETH",
  137: "MATIC",
  43114: "AVAX",
};

type Thresholds = {
  native: bigint;
  link: bigint;
};

const NOTIFICATION_THRESHOLDS: Record<number, Thresholds> = {
  1: {
    native: BigInt(8e16),
    link: BigInt(5e18),
  },
  137: {
    native: BigInt(350e18),
    link: BigInt(15e18),
  },
  43114: {
    native: BigInt(120e18),
    link: BigInt(15e18),
  },
};

export const GET = async (req: Request) => {
  if (req.headers.get("Authorization") !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Ignore preprod
  if (env.ENVIRONMENT_STAGE === "PREPROD") {
    return NextResponse.json({ ok: true });
  }

  try {
    const crossChainControllers = await getCrossChainControllers();
    const balancePromises = crossChainControllers.map(
      async (crossChainController) => {
        if (
          !CHAIN_IDS_FOR_BALANCE_RETRIEVAL.includes(
            crossChainController.chain_id,
          )
        )
          return null;

        return await getBalance({
          chainId: crossChainController.chain_id,
          address: crossChainController.address as Hash,
        });
      },
    );

    const balanceArray = await Promise.all(balancePromises);

    const balances: Record<
      number,
      {
        native: bigint;
        link: bigint | null;
      }
    > = balanceArray.reduce(
      (
        acc: Record<
          number,
          {
            native: bigint;
            link: bigint | null;
          }
        >,
        item,
      ) => {
        if (item) {
          acc[item.chain_id] = {
            native: item.balance,
            link: item.linkBalance,
          };
        }
        return acc;
      },
      {},
    );

    const today = new Date().toISOString().slice(0, 10);
    const errors: Array<{ chainId: string; error: string }> = [];

    for (const [chainId, balance] of Object.entries(balances)) {
      try {
        const thresholds = NOTIFICATION_THRESHOLDS[Number(chainId)];
        if (!thresholds) continue;

        const chain = Object.values(chains).find(
          (chain) => chain.id === Number(chainId),
        );

        if (balance.native < thresholds.native) {
          console.log(
            `🔴 Native token balance is below threshold on chain ${chain?.name} - ${formatEther(balance.native)}`,
          );

          await sendNotification({
            hashInput: `low-balance-${chain?.name}-native-${today}`,
            data: {
              type: "low_balance",
              chainName: chain?.name ?? "Unknown",
              balance: formatEther(balance.native),
              tokenName: CHAIN_ID_TO_CURRENCY[Number(chainId)] ?? "",
            },
            send: () =>
              sendSlackBalanceWarning({
                chainName: chain?.name ?? "Unknown",
                threshold: formatEther(thresholds.native),
                balance: formatEther(balance.native),
                tokenName: CHAIN_ID_TO_CURRENCY[Number(chainId)] ?? "",
              }),
          });
        }

        if (balance.link && balance.link < thresholds.link) {
          console.log(
            `🔴 LINK token balance is below threshold on chain ${chain?.name} - ${formatEther(balance.link)}`,
          );

          await sendNotification({
            hashInput: `low-balance-${chain?.name}-link-${today}`,
            data: {
              type: "low_balance",
              chainName: chain?.name ?? "Unknown",
              balance: formatEther(balance.link),
              tokenName: "LINK",
            },
            send: () =>
              sendSlackBalanceWarning({
                chainName: chain?.name ?? "Unknown",
                threshold: formatEther(thresholds.link),
                balance: formatEther(balance.link!),
                tokenName: "LINK",
              }),
          });
        }

        if (
          balance.native > thresholds.native &&
          balance.link &&
          balance.link > thresholds.link
        ) {
          console.log(`🟢 All balances are above threshold on ${chain?.name}`);
        }
      } catch (error) {
        console.error(`Failed to check balance for chain ${chainId}:`, error);
        errors.push({
          chainId,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    if (errors.length > 0) {
      return NextResponse.json({ ok: false, errors }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Balance notification cron failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
};
