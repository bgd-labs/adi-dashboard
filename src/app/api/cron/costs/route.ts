import { NextResponse } from "next/server";
import { calculateTxCosts } from "@/server/eventCollection/calculateTxCosts";
import { api } from "@/trpc/server";
import { env } from "@/env";
import { type Hash } from "viem";

export const GET = async (req: Request) => {
  if (req.headers.get("Authorization") !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const unscannedTxs = await api.transactions.getUnscannedTransactions.query();

  for (let i = 0; i < unscannedTxs.length; i++) {
    const pair = unscannedTxs[i];
    if (!pair) {
      return;
    }
    setTimeout(() => {
      void (async () => {
        try {
          console.log(
            `${i + 1}/${unscannedTxs.length} `,
            "Calculating transaction costs for:",
            pair.transaction_hash! as Hash,
            pair.chain_id!,
          );
          await calculateTxCosts(
            pair.transaction_hash! as Hash,
            pair.chain_id!,
          );
        } catch (error) {
          console.error("Error calculating transaction costs:", error);
        }
      })();
    }, i * 4000);
  }

  return NextResponse.json({ ok: true });
};
