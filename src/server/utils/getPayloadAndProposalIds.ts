import { type Hash } from "viem";

import { decodeEnvelopeMessage } from "@/server/utils/decodeEnvelopeMessage";
import { getPayloadProposalRelation } from "@/server/utils/getPayloadProposalRelation";

export const getPayloadAndProposalIds = async (
  origin: string,
  message: string,
  chainId: number,
) => {
  const messageData = Buffer.from(message.slice(2), "hex").toString(
    "utf8",
  ) as Hash;

  const decodedMessage = decodeEnvelopeMessage(origin, messageData);

  let proposal_id = null;
  let payload_id = null;

  try {
    if (
      decodedMessage?.data?.payloadId !== null &&
      decodedMessage?.data?.payloadId !== undefined
    ) {
      payload_id = decodedMessage?.data.payloadId;
      proposal_id = await getPayloadProposalRelation(
        decodedMessage?.data.payloadId,
        chainId,
      );
    }

    if (
      decodedMessage?.data?.proposalId !== null &&
      decodedMessage?.data?.proposalId !== undefined
    ) {
      proposal_id = decodedMessage?.data.proposalId;
    }
  } catch (e) {
    console.error("Error getting payload and proposal ids", e);
  }

  return [
    proposal_id !== null && proposal_id !== undefined
      ? Number(proposal_id)
      : null,
    payload_id !== null && payload_id !== undefined ? Number(payload_id) : null,
  ];
};
