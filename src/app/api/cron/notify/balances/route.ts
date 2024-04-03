import * as chains from "viem/chains";
import crypto from "crypto";
import { NextResponse } from "next/server";
import { env } from "@/env";
import { getBalance } from "@/server/utils/getBalance";
import { getCrossChainControllers } from "@/server/eventCollection/getCrossChainControllers";
import { type Hash, formatEther } from "viem";
import { sendSlackBalanceWarning } from "@/server/utils/sendSlackBalanceWarning";
import { supabaseAdmin } from "@/server/api/supabase";

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
    native: BigInt(8e17),
    link: BigInt(10e18),
  },
  137: {
    native: BigInt(350e18),
    link: BigInt(15e18),
  },
  43114: {
    native: BigInt(350e18),
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

  const crossChainControllers = await getCrossChainControllers();
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

  for (const [chainId, balance] of Object.entries(balances)) {
    const thresholds = NOTIFICATION_THRESHOLDS[Number(chainId)];
    if (!thresholds) continue;

    const chain = Object.values(chains).find(
      (chain) => chain.id === Number(chainId),
    );

    if (balance.native < thresholds.native) {
      console.log(
        `🔴 Native token balance is below threshold on chain ${chain?.name} - ${formatEther(balance.native)}`,
      );

      const notificationHash = crypto
        .createHash("sha256")
        .update(`${chain?.name}-${Number(balance.native)}`)
        .digest("hex");

      const { data: wasAlreadyNotified } = await supabaseAdmin
        .from("SentNotifications")
        .select("*")
        .eq("notification_hash", notificationHash)
        .single();

      if (!wasAlreadyNotified) {
        await sendSlackBalanceWarning({
          chainName: chain?.name ?? "Unknown",
          threshold: formatEther(thresholds.native),
          balance: formatEther(balance.native),
          tokenName: CHAIN_ID_TO_CURRENCY[Number(chainId)] ?? "",
        });

        await supabaseAdmin.from("SentNotifications").insert([
          {
            notification_hash: notificationHash,
            data: {
              type: "low_balance",
              chainName: chain?.name ?? "Unknown",
              balance: formatEther(balance.native),
              tokenName: CHAIN_ID_TO_CURRENCY[Number(chainId)] ?? "",
            },
          },
        ]);
      }
    }
    if (balance.link && balance.link < thresholds.link) {
      console.log(
        `🔴 LINK token balance is below threshold on chain ${chain?.name} - ${formatEther(balance.link)}`,
      );

      const notificationHash = crypto
        .createHash("sha256")
        .update(`${chain?.name}-${Number(balance.link)}`)
        .digest("hex");

      const { data: wasAlreadyNotified } = await supabaseAdmin
        .from("SentNotifications")
        .select("*")
        .eq("notification_hash", notificationHash)
        .single();

      if (!wasAlreadyNotified) {
        await sendSlackBalanceWarning({
          chainName: chain?.name ?? "Unknown",
          threshold: formatEther(thresholds.link),
          balance: formatEther(balance.link),
          tokenName: "LINK",
        });

        await supabaseAdmin.from("SentNotifications").insert([
          {
            notification_hash: notificationHash,
            data: {
              type: "low_balance",
              chainName: chain?.name ?? "Unknown",
              balance: formatEther(balance.link),
              tokenName: "LINK",
            },
          },
        ]);
      }
    }

    if (
      balance.native > thresholds.native &&
      balance.link &&
      balance.link > thresholds.link
    ) {
      console.log(`🟢 All balances are above threshold on ${chain?.name}`);
    }
  }

  return NextResponse.json({ ok: true });
};
