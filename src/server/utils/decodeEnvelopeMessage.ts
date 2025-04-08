import { decodeAbiParameters, type Hash } from "viem";

const GOVERNANCE_FROM_ADDRESS = "0x9AEE0B04504CeF83A65AC3f0e838D0593BCb2BC7";
const governanceAbi = [
  {
    name: "payloadId",
    type: "uint40",
  },
  {
    name: "accessLevel",
    type: "uint8",
  },
  {
    name: "timestamp",
    type: "uint40",
  },
];

const VOTING_PORTAL_FROM_ADDRESSES = [
  "0xf23f7De3AC42F22eBDA17e64DC4f51FB66b8E21f",
  "0x33aCEf7365809218485873B7d0d67FeE411B5D79",
  "0x9b24C168d6A76b5459B1d47071a54962a4df36c3",
  "0x6ACe1Bf22D57a33863161bFDC851316Fb0442690",
  "0xFe4683C18aaad791B6AFDF0a8e1Ed5C6e2c9ecD6",
  "0x9Ded9406f088C10621BE628EEFf40c1DF396c172",
];

const votingPortalPayloadAbi = [
  {
    name: "proposalId",
    type: "uint256",
  },
  {
    name: "blockHash",
    type: "bytes32",
  },
  {
    name: "votingDuration",
    type: "uint24",
  },
];

const votingPortalMessageWithTypeAbi = [
  {
    name: "type",
    type: "uint256",
  },
  {
    name: "payload",
    type: "bytes",
  },
];

const VOTING_MACHINE_FROM_ADDRESSES = [
  "0x617332a777780F546261247F621051d0b98975Eb",
  "0xc8a2ADC4261c6b669CdFf69E717E77C9cFeB420d",
  "0x9b6f5ef589A3DD08670Dd146C11C4Fb33E04494F",
  "0x06a1795a88b82700896583e123F46BE43877bFb6",
  "0x44c8b753229006A8047A05b90379A7e92185E97C",
  "0x4D1863d22D0ED8579f8999388BCC833CB057C2d6",
];

const votingMachinePayloadAbi = [
  {
    name: "proposalId",
    type: "uint256",
  },
  {
    name: "forVotes",
    type: "uint96",
  },
  {
    name: "againstVotes",
    type: "uint96",
  },
];

export const decodeEnvelopeMessage = (from: string, messageData: Hash) => {
  if (from === GOVERNANCE_FROM_ADDRESS) {
    const decodedMessage = decodeAbiParameters(governanceAbi, messageData);
    return {
      type: "Payload Execution Message",
      data: {
        payloadId: decodedMessage[0] as number,
        accessLevel: decodedMessage[1] as number,
        timestamp: decodedMessage[2] as number,
      },
    };
  }

  if (VOTING_PORTAL_FROM_ADDRESSES.includes(from)) {
    const decodedMessageWithType = decodeAbiParameters(
      votingPortalMessageWithTypeAbi,
      messageData,
    );

    const decodedPayload = decodeAbiParameters(
      votingPortalPayloadAbi,
      decodedMessageWithType[1] as Hash,
    );

    return {
      type: "Activate Voting Message",
      data: {
        proposalId: decodedPayload[0] as number,
        blockHash: decodedPayload[1] as string,
        votingDuration: decodedPayload[2] as number,
      },
    };
  }

  if (VOTING_MACHINE_FROM_ADDRESSES.includes(from)) {
    const decodedPayload = decodeAbiParameters(
      votingMachinePayloadAbi,
      messageData,
    );

    return {
      type: "Voting Results Message",
      data: {
        proposalId: decodedPayload[0] as number,
        forVotes: decodedPayload[1] as number,
        againstVotes: decodedPayload[2] as number,
      },
    };
  }

  return null;
};
