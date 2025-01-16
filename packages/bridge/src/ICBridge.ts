import { type ActorSubclass, type Agent } from "@dfinity/agent";

import type { IDL } from "@dfinity/candid";
import { IcrcLedgerCanister } from "@dfinity/ledger-icrc";
import { Principal } from "@dfinity/principal";
import type { ChainID, OnBridgeParams, Token } from ".";
import {
  idlFactory as ICPCustomsInterfaceFactory,
  type _SERVICE,
} from "./candids/IcpCustoms.did";
import {
  idlFactory as IcrcLedgerInterfaceFactory,
  type _SERVICE as IcrcLedgerService,
} from "./candids/IcrcLedger.did";
import {
  idlFactory as ICPRouteInterfaceFactory,
  type _SERVICE as ICPRouteService,
} from "./candids/IcpRoute.did";
import { createActor } from "./utils";
import { AccountIdentifier, LedgerCanister } from "@dfinity/ledger-icp";

const icpChainCanisterId = "nlgkm-4qaaa-aaaar-qah2q-cai";
export class ICBridge {
  private actor: ActorSubclass<ICPRouteService>;
  // private chain: Chain;
  // private provider: JsonRpcProvider;
  // private signer: ethers.Signer;

  constructor() {
    // this.chain = chain;
    // this.provider = provider;
    // this.signer = this.provider.getSigner();
    this.actor = createActor<ICPRouteService>(
      icpChainCanisterId,
      ICPRouteInterfaceFactory
    );
  }

  async onBridge(params: OnBridgeParams): Promise<string> {
    const {
      token,
      sourceAddr,
      targetAddr,
      targetChainId,
      amount,
      createActor,
      transfer,
    } = params;

    if (!createActor) {
      throw new Error("createActor is required");
    }

    const actor = await createActor<_SERVICE>(
      icpChainCanisterId,
      ICPCustomsInterfaceFactory
    );

    const result = await this.prepareForGenerateTicket({
      token,
      userAddr: sourceAddr,
      amount,
      targetChainId,
      transfer,
      createActor,
    });

    console.log("prepareForGenerateTicketResult", result);
    const ticketResult = await actor.generate_ticket_v2({
      token_id: token.token_id,
      from_subaccount: [],
      target_chain_id: targetChainId,
      amount,
      receiver: targetAddr,
      memo: [],
    });

    console.log("ticketResult", ticketResult);

    if ("Err" in ticketResult) {
      console.error(ticketResult.Err);
      throw new Error("Failed to generate ticket");
    }

    return ticketResult.Ok.ticket_id;
  }

  async onApprove({
    token,
    sourceAddr,
    amount,
    createActor,
  }: Pick<
    OnBridgeParams,
    "token" | "sourceAddr" | "amount" | "createActor"
  >): Promise<void> {
    if (!createActor) {
      throw new Error("createActor is required");
    }

    console.log(
      "Amount to bridge:",
      Number(amount) / Math.pow(10, token.decimals),
      token.symbol
    );

    const spender = Principal.fromText(icpChainCanisterId);
    const account = Principal.fromText(sourceAddr);

    const { allowance, transactionFee } = IcrcLedgerCanister.create({
      canisterId: Principal.fromText(token.id),
    });

    const txFee = await transactionFee({ certified: false });
    console.log(
      "Transaction Fee:",
      Number(txFee) / Math.pow(10, token.decimals),
      token.symbol
    );

    const approvingAmount = amount + txFee;
    console.log(
      "Total amount to approve:",
      Number(approvingAmount) / Math.pow(10, token.decimals),
      token.symbol
    );

    const { allowance: allowanceAmount } = await allowance({
      spender: {
        owner: spender,
        subaccount: [],
      },
      account: {
        owner: account,
        subaccount: [],
      },
    });

    console.log(
      "Current allowance:",
      Number(allowanceAmount) / Math.pow(10, token.decimals),
      token.symbol
    );

    if (allowanceAmount < approvingAmount) {
      console.log("Current allowance insufficient. Initiating approval...");

      const icrcLedger = await createActor<IcrcLedgerService>(
        token.id,
        IcrcLedgerInterfaceFactory
      );

      try {
        await icrcLedger.icrc2_approve({
          fee: [],
          memo: [],
          from_subaccount: [],
          created_at_time: [],
          amount: approvingAmount,
          spender: {
            owner: spender,
            subaccount: [],
          },
          expires_at: [],
          expected_allowance: [],
        });
        console.log("Approval successful!");
      } catch (error) {
        console.error("Approval failed:", error);
        throw error;
      }
    } else {
      console.log("Current allowance is sufficient, skipping approval");
    }
  }

  async prepareForGenerateTicket({
    token,
    userAddr,
    amount,
    targetChainId,
    transfer,
    createActor,
  }: {
    token: Token;
    userAddr: string;
    amount: bigint;
    targetChainId: ChainID;
    transfer?: (params: {
      to: string;
      amount: bigint;
    }) => Promise<number | bigint | undefined>;
    createActor?: <T>(
      canisterId: string,
      interfaceFactory: IDL.InterfaceFactory
    ) => Promise<ActorSubclass<T>>;
  }) {
    console.log("starting prepareForGenerateTicket");
    if (!transfer) {
      throw new Error("transfer is required");
    }

    await this.onApprove({
      token,
      sourceAddr: userAddr,
      amount,
      createActor,
    });

    const account = Principal.fromText(userAddr);
    console.log("account", account);
  }

  async checkMintStatus(ticketId: string): Promise<"Finalized" | "Unknown"> {
    const actor = createActor<_SERVICE>(
      icpChainCanisterId,
      ICPCustomsInterfaceFactory
    );

    const status = await actor.mint_token_status(ticketId);

    console.log("🎫 Ticket Status:", status);

    if ("Finalized" in status) {
      console.log("Transaction Hash:", status.Finalized.tx_hash);
      return "Finalized";
    } else {
      return "Unknown";
    }
  }
}
