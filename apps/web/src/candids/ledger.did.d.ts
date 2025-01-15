import type { Principal } from "@dfinity/principal";
export interface AccountBalanceArgs {
  account: AccountIdentifier;
}
export type AccountIdentifier = string;
export interface Archive {
  canister_id: Principal;
}
export interface ArchiveOptions {
  num_blocks_to_archive: bigint;
  trigger_threshold: bigint;
  max_message_size_bytes: [] | [bigint];
  cycles_for_archive_creation: [] | [bigint];
  node_max_memory_size_bytes: [] | [bigint];
  controller_id: Principal;
}
export interface Archives {
  archives: Array<Archive>;
}
export interface Block {
  transaction: Transaction;
  timestamp: TimeStamp;
  parent_hash: [] | [Array<number>];
}
export type BlockHeight = bigint;
export type BlockIndex = bigint;
export interface BlockRange {
  blocks: Array<Block>;
}
export interface Duration {
  secs: bigint;
  nanos: number;
}
export interface GetBlocksArgs {
  start: BlockIndex;
  length: bigint;
}
export interface LedgerCanisterInitPayload {
  send_whitelist: Array<Principal>;
  token_symbol: [] | [string];
  transfer_fee: [] | [Tokens];
  minting_account: AccountIdentifier;
  transaction_window: [] | [Duration];
  max_message_size_bytes: [] | [bigint];
  archive_options: [] | [ArchiveOptions];
  initial_values: Array<[AccountIdentifier, Tokens]>;
  token_name: [] | [string];
}
export type Memo = bigint;
export type Operation =
  | {
      Burn: { from: AccountIdentifier; amount: Tokens };
    }
  | { Mint: { to: AccountIdentifier; amount: Tokens } }
  | {
      Transfer: {
        to: AccountIdentifier;
        fee: Tokens;
        from: AccountIdentifier;
        amount: Tokens;
      };
    };
export type QueryArchiveError =
  | {
      BadFirstBlockIndex: {
        requested_index: BlockIndex;
        first_valid_index: BlockIndex;
      };
    }
  | { Other: { error_message: string; error_code: bigint } };
export type QueryArchiveFn = (
  arg_0: GetBlocksArgs
) => Promise<QueryArchiveResult>;
export type QueryArchiveResult =
  | { Ok: BlockRange }
  | { Err: QueryArchiveError };
export interface QueryBlocksResponse {
  certificate: [] | [Array<number>];
  blocks: Array<Block>;
  chain_length: bigint;
  first_block_index: BlockIndex;
  archived_blocks: Array<{
    callback: QueryArchiveFn;
    start: BlockIndex;
    length: bigint;
  }>;
}
export interface SendArgs {
  to: AccountIdentifier;
  fee: Tokens;
  memo: Memo;
  from_subaccount: [] | [SubAccount];
  created_at_time: [] | [TimeStamp];
  amount: Tokens;
}
export type SubAccount = Array<number>;
export interface TimeStamp {
  timestamp_nanos: bigint;
}
export interface Tokens {
  e8s: bigint;
}
export interface Transaction {
  memo: Memo;
  operation: [] | [Operation];
  created_at_time: TimeStamp;
}
export interface TransferArgs {
  to: AccountIdentifier;
  fee: Tokens;
  memo: Memo;
  from_subaccount: [] | [SubAccount];
  created_at_time: [] | [TimeStamp];
  amount: Tokens;
}
export type TransferError =
  | {
      TxTooOld: { allowed_window_nanos: bigint };
    }
  | { BadFee: { expected_fee: Tokens } }
  | { TxDuplicate: { duplicate_of: BlockIndex } }
  | { TxCreatedInFuture: null }
  | { InsufficientFunds: { balance: Tokens } };
export interface TransferFee {
  transfer_fee: Tokens;
}
export type TransferFeeArg = {};
export type TransferResult = { Ok: BlockIndex } | { Err: TransferError };
export interface _SERVICE {
  account_balance: (arg_0: AccountBalanceArgs) => Promise<Tokens>;
  account_balance_dfx: (arg_0: AccountBalanceArgs) => Promise<Tokens>;
  archives: () => Promise<Archives>;
  decimals: () => Promise<{ decimals: number }>;
  mint: (arg_0: SendArgs) => Promise<TransferResult>;
  name: () => Promise<{ name: string }>;
  query_blocks: (arg_0: GetBlocksArgs) => Promise<QueryBlocksResponse>;
  send_dfx: (arg_0: SendArgs) => Promise<BlockHeight>;
  symbol: () => Promise<{ symbol: string }>;
  transfer: (arg_0: SendArgs) => Promise<TransferResult>;
  transfer_fee: (arg_0: TransferFeeArg) => Promise<TransferFee>;
}

type T0 = Parameters<IDL.InterfaceFactory>;
export function idlFactory({ IDL }: T0[0]): ReturnType<IDL.InterfaceFactory>;
