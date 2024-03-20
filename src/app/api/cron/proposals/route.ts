import { NextResponse } from "next/server";
import { env } from "@/env";
import { supabaseAdmin } from "@/server/api/supabase";
import { getPayloadAndProposalIds } from "@/server/utils/getPayloadAndProposalIds";

export const GET = async (req: Request) => {
  if (req.headers.get("Authorization") !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (env.ENVIRONMENT_STAGE === 'PREPROD') {
    return NextResponse.json({ ok: true });
  }

  const { data: envelopes } = await supabaseAdmin
    .from("Envelopes")
    .select(`id, origin, message, destination_chain_id`, { count: "exact" })
    .is("proposal_id", null)
    .is("payload_id", null);

  if (!envelopes) {
    console.log("No envelopes with empty payloads found");
    return NextResponse.json({ ok: true });
  }

  for (const envelope of envelopes) {
    if (!envelope.message) {
      continue;
    }

    const [proposalId, payloadId] = await getPayloadAndProposalIds(
      envelope.origin!,
      envelope.message,
      envelope.destination_chain_id!,
    );

    if (proposalId ?? payloadId) {
      const { error } = await supabaseAdmin
        .from("Envelopes")
        .update({
          proposal_id: proposalId,
          payload_id: payloadId,
        })
        .eq("id", envelope.id);
      if (error) {
        console.error("Error updating envelope", error);
      }
      console.log(
        `Updated envelope ${envelope.id} with proposalId ${proposalId} and payloadId ${payloadId}`,
      );
    }
  }

  return NextResponse.json({ ok: true });
};
