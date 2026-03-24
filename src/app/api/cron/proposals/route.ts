import { eq, isNull, and } from "drizzle-orm";
import { NextResponse } from "next/server";

import { env } from "@/env";
import { db } from "@/server/db";
import { envelopes } from "@/server/db/schema";
import { getPayloadAndProposalIds } from "@/server/utils/getPayloadAndProposalIds";

export const GET = async (req: Request) => {
  if (req.headers.get("Authorization") !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (env.ENVIRONMENT_STAGE === "PREPROD") {
    return NextResponse.json({ ok: true });
  }

  const envelopesList = await db
    .select({
      id: envelopes.id,
      origin: envelopes.origin,
      message: envelopes.message,
      destination_chain_id: envelopes.destination_chain_id,
    })
    .from(envelopes)
    .where(and(isNull(envelopes.proposal_id), isNull(envelopes.payload_id)));

  if (!envelopesList.length) {
    console.log("No envelopes with empty payloads found");
    return NextResponse.json({ ok: true });
  }

  for (const envelope of envelopesList) {
    if (!envelope.message) {
      continue;
    }

    const [proposalId, payloadId] = await getPayloadAndProposalIds(
      envelope.origin!,
      envelope.message,
      envelope.destination_chain_id!,
    );

    if (proposalId ?? payloadId) {
      try {
        await db
          .update(envelopes)
          .set({
            proposal_id: proposalId,
            payload_id: payloadId,
          })
          .where(eq(envelopes.id, envelope.id));
        console.log(
          `Updated envelope ${envelope.id} with proposalId ${proposalId} and payloadId ${payloadId}`,
        );
      } catch (error) {
        console.error("Error updating envelope", error);
      }
    }
  }

  return NextResponse.json({ ok: true });
};
