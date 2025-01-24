import { ActorSubclass } from "@dfinity/agent";
import { IDL } from "@dfinity/candid";
import type { Chain as EvmChain } from "viem";

export interface BitfinityChain {
  chainId: string;
  canisterId: string;
  evmChain: EvmChain;
  portContractAddress: string;
}
export enum ChainName {
  ICP = "ICP",
  Bitcoin = "Bitcoin",
  BEVM = "BEVM",
  BitLayer = "Bitlayer",
  BSquared = "B² Network",
  XLayer = "X Layer",
  Merlin = "Merlin",
  Bob = "Bob",
  Rootstock = "Rootstock",
  Bitfinity = "Bitfinity",
  AILayer = "AILayer",
  Solana = "Solana",
  Ethereum = "Ethereum",
}
export enum ChainID {
  eICP = "eICP",
  Bitcoin = "Bitcoin",
  BEVM = "bevm",
  BitLayer = "Bitlayer",
  BSquared = "B² Network",
  XLayer = "X Layer",
  Merlin = "Merlin",
  Bob = "Bob",
  RootStock = "RootStock",
  Bitfinity = "Bitfinity",
  AILayer = "AILayer",
  sICP = "sICP",
  Solana = "eSolana",
  Ethereum = "Ethereum",
}

export interface Token {
  id: string; // ICP: canisterId, BTC: rune_id, EVM: contract address
  name: string;
  symbol: string;
  decimals: number;
  icon?: string;
  balance: bigint;
  token_id: string;
  fee: bigint;
  chain_id: ChainID;
  composed_balance?: {
    available: bigint;
  };
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

export interface OnBridgeParams {
  token: Token;
  amount: bigint;
  sourceAddr: string;
  targetAddr: string;
  targetChainId: ChainID;
  setStep?: (step: number) => void;
  feeRate?: number;
  createActor?: <T>(
    canisterId: string,
    interfaceFactory: IDL.InterfaceFactory
  ) => Promise<ActorSubclass<T>>;
}
export enum ChainType {
  Settlement = "SettlementChain",
  ExecutionChain = "ExecutionChain",
}

export enum ChainState {
  Active = "Active",
  Deactive = "Deactive",
}
export enum ServiceType {
  Route = "Route",
  Customs = "Customs",
}
export interface Chain {
  canisterId: string;
  contractAddress?: string;
  evmChain?: EvmChain;
}
