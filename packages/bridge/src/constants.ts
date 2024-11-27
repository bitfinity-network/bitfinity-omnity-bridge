export const OMNITY_PORT_ABI = [
  {
    inputs: [
      {
        internalType: "string",
        name: "tokenId",
        type: "string",
      },
      {
        internalType: "string",
        name: "receiver",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "redeemToken",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "dstChainId",
        type: "string",
      },
      {
        internalType: "string",
        name: "tokenId",
        type: "string",
      },
      {
        internalType: "string",
        name: "receiver",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "memo",
        type: "string",
      },
    ],
    name: "transportToken",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "tokenId",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "burnToken",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
] as const;
