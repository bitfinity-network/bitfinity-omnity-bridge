import type { Chain as EvmChain } from "viem";

export interface BitfinityChain {
  chainId: string;
  canisterId: string;
  evmChain: EvmChain;
  portContractAddress: string;
}

export interface Token {
  decimals: number;
  symbol: string;
  name: string;
  tokenId: string;
  contractAddress: string;
  balance: bigint;
  icon: string;
}

export interface BridgeToEvmParams {
  token: Token;
  sourceIcAddress: string;
  targetEvmAddress: string;
  amount: bigint;
}

export interface BridgeFee {
  fee: bigint;
  symbol: string;
  decimals: number;
}

export interface BridgeTicket {
  ticketId: string;
  tokenId: string;
}

export type BridgeStatus = "Pending" | "Processing" | "Finalized" | "Failed";

export interface BridgeStatusResult {
  status: BridgeStatus;
  evmTxHash?: string;
}
