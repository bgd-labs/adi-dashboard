import { NextResponse } from "next/server";
import { getPayloadAndProposalIds } from "@/server/utils/getPayloadAndProposalIds";
import { supabaseAdmin } from "@/server/api/supabase";

export const GET = async () => {
  const { data, count } = await supabaseAdmin
    .from("Envelopes")
    .select(`*`, { count: "exact" });

  let i = 1;

  for (const envelope of data!) {
    const [proposal_id, payload_id] = await getPayloadAndProposalIds(
      envelope.origin!,
      envelope.message!,
    );

    await supabaseAdmin.from("Envelopes").upsert([
      {
        id: envelope.id,
        proposal_id: proposal_id === null ? null : Number(proposal_id),
        payload_id: payload_id === null ? null : Number(payload_id),
      },
    ]);


    console.log(`[${i}/${count}] Updated envelope ${envelope.id}`)
    i++;
  }
  

  return NextResponse.json({ ok: true });
};
