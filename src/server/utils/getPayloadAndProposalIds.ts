import { type Hash } from "viem";
import { getPayloadProposalRelation } from "@/server/utils/getPayloadProposalRelation";
import { decodeEnvelopeMessage } from "@/server/utils/decodeEnvelopeMessage";

export const getPayloadAndProposalIds = async (
  origin: string,
  message: string,
) => {
  const messageData = Buffer.from(message!.slice(2), "hex").toString(
    "utf8",
  ) as Hash;

  const decodedMessage = decodeEnvelopeMessage(origin, messageData);

  let proposal_id = null;
  let payload_id = null;

  try {
    if (decodedMessage?.data?.payloadId) {
      payload_id = decodedMessage?.data.payloadId;
      proposal_id = await getPayloadProposalRelation(
        decodedMessage?.data.payloadId,
      );
    }
  
    if (decodedMessage?.data?.proposalId) {
      proposal_id = decodedMessage?.data.proposalId;
    }
  } catch (e) {
    console.error("Error getting payload and proposal ids", e);
  }

  return [proposal_id, payload_id];
};
