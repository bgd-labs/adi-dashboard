export const cccEventsAbi = [
  {
    "type": "event",
    "name": "EnvelopeDeliveryAttempted",
    "inputs": [
      {
        "name": "envelopeId",
        "type": "bytes32",
        "indexed": false,
        "internalType": "bytes32"
      },
      {
        "name": "envelope",
        "type": "tuple",
        "indexed": false,
        "internalType": "struct Envelope",
        "components": [
          {
            "name": "nonce",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "origin",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "destination",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "originChainId",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "destinationChainId",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "message",
            "type": "bytes",
            "internalType": "bytes"
          }
        ]
      },
      {
        "name": "isDelivered",
        "type": "bool",
        "indexed": false,
        "internalType": "bool"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "EnvelopeRegistered",
    "inputs": [
      {
        "name": "envelopeId",
        "type": "bytes32",
        "indexed": true,
        "internalType": "bytes32"
      },
      {
        "name": "envelope",
        "type": "tuple",
        "indexed": false,
        "internalType": "struct Envelope",
        "components": [
          {
            "name": "nonce",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "origin",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "destination",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "originChainId",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "destinationChainId",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "message",
            "type": "bytes",
            "internalType": "bytes"
          }
        ]
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "TransactionForwardingAttempted",
    "inputs": [
      {
        "name": "transactionId",
        "type": "bytes32",
        "indexed": false,
        "internalType": "bytes32"
      },
      {
        "name": "envelopeId",
        "type": "bytes32",
        "indexed": true,
        "internalType": "bytes32"
      },
      {
        "name": "encodedTransaction",
        "type": "bytes",
        "indexed": false,
        "internalType": "bytes"
      },
      {
        "name": "destinationChainId",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "bridgeAdapter",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "destinationBridgeAdapter",
        "type": "address",
        "indexed": false,
        "internalType": "address"
      },
      {
        "name": "adapterSuccessful",
        "type": "bool",
        "indexed": true,
        "internalType": "bool"
      },
      {
        "name": "returnData",
        "type": "bytes",
        "indexed": false,
        "internalType": "bytes"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "TransactionReceived",
    "inputs": [
      {
        "name": "transactionId",
        "type": "bytes32",
        "indexed": false,
        "internalType": "bytes32"
      },
      {
        "name": "envelopeId",
        "type": "bytes32",
        "indexed": true,
        "internalType": "bytes32"
      },
      {
        "name": "originChainId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "transaction",
        "type": "tuple",
        "indexed": false,
        "internalType": "struct Transaction",
        "components": [
          {
            "name": "nonce",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "encodedEnvelope",
            "type": "bytes",
            "internalType": "bytes"
          }
        ]
      },
      {
        "name": "bridgeAdapter",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "confirmations",
        "type": "uint8",
        "indexed": false,
        "internalType": "uint8"
      }
    ],
    "anonymous": false
  },
] as const;