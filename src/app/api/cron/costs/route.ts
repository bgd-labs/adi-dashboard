import { NextResponse } from "next/server";
import { type Hash } from "viem";

import { env } from "@/env";
import { calculateTxCosts } from "@/server/eventCollection/calculateTxCosts";
import { api } from "@/trpc/server";

export const maxDuration = 100;

export const GET = async (req: Request) => {
  if (req.headers.get("Authorization") !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const unscannedTxs = await api.transactions.getUnscannedTransactions();

  if (unscannedTxs?.length === 0 || !unscannedTxs) {
    return NextResponse.json({ ok: true });
  }

  console.log(`Found ${unscannedTxs?.length} unscanned transactions.`);

  for (let i = 0; i < unscannedTxs.length; i++) {
    const pair = unscannedTxs[i];
    if (!pair || typeof pair.chain_id !== "number") {
      return;
    }
    try {
      console.log(
        `${i + 1}/${unscannedTxs.length} `,
        "Calculating transaction costs for:",
        pair.transaction_hash as Hash,
        pair.chain_id,
      );
      await calculateTxCosts(
        pair.transaction_hash as Hash,
        pair.chain_id as number,
      );
    } catch (error) {
      console.error("Error calculating transaction costs:", error);
    }
  }

  return NextResponse.json({ ok: true });
};
