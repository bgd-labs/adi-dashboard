export const cccAbi = [
  {
    type: "function",
    name: "retryEnvelope",
    inputs: [
      {
        name: "envelope",
        type: "tuple",
        internalType: "struct Envelope",
        components: [
          {
            name: "nonce",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "origin",
            type: "address",
            internalType: "address",
          },
          {
            name: "destination",
            type: "address",
            internalType: "address",
          },
          {
            name: "originChainId",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "destinationChainId",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "message",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
      {
        name: "gasLimit",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "retryTransaction",
    inputs: [
      {
        name: "encodedTransaction",
        type: "bytes",
        internalType: "bytes",
      },
      {
        name: "gasLimit",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "bridgeAdaptersToRetry",
        type: "address[]",
        internalType: "address[]",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;
