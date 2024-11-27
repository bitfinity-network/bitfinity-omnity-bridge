# @bitfinity/bridge

Official Bitfinity Bridge SDK for transferring tokens between Internet Computer and Bitfinity EVM via Omnity Protocol.

## Overview

This SDK provides a TypeScript interface for bridging tokens between Internet Computer and Bitfinity EVM using Omnity's cross-chain infrastructure. It simplifies the integration of Omnity's bridging protocol into your applications.

## Installation

```bash
npm install @bitfinity/bridge
# or
yarn add @bitfinity/bridge
# or
pnpm add @bitfinity/bridge
```

## Usage

```typescript
import { BitfinityBridge } from "@bitfinity/bridge";
import { bitfinity } from "viem/chains";

// Initialize the bridge
const bridge = new BitfinityBridge({
  chainId: "bitfinity_2024",
  canisterId: "your_canister_id", // Omnity canister ID
  evmChain: bitfinity,
  portContractAddress: "0x...", // Omnity port contract address
});

// Bridge tokens from IC to Bitfinity via Omnity
const txHash = await bridge.bridgeToEvm({
  token: myToken,
  sourceIcAddress: "ic_address",
  targetEvmAddress: "0xTarget...",
  amount: BigInt("1000000000000000000"),
});

// Get bridge fee (from Omnity)
const fee = await bridge.getBridgeFee();

// Get available tokens
const tokens = await bridge.getTokenList();

// Check bridge status via Omnity
const status = await bridge.getBridgeStatus({
  ticketId: "tx_hash",
  tokenId: "token_id",
});
```

## Features

- Bridge tokens between Internet Computer and Bitfinity EVM using Omnity Protocol
- Get bridge fees from Omnity
- Get available tokens
- Track bridge status
- Validate EVM addresses

## Architecture

```
┌──────────────┐     ┌─────────────┐     ┌──────────────┐
│     IC       │     │   Omnity    │     │   Bitfinity  │
│  (Source)    │ --> │  Protocol   │ --> │     EVM      │
└──────────────┘     └─────────────┘     └──────────────┘
```

The bridging process:

1. User initiates bridge from IC
2. Omnity Protocol handles the cross-chain transfer
3. Tokens are minted/transferred on Bitfinity EVM

## Development

```bash
# Install dependencies
pnpm install

# Run dev server
pnpm dev
```
