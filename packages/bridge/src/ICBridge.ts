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

const icpChainCanisterId = "7ywcn-nyaaa-aaaar-qaeza-cai";
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

    await this.prepareForGenerateTicket({
      token,
      userAddr: sourceAddr,
      amount,
      targetChainId,
      transfer,
      createActor,
    });

    const ticketResult = await actor.generate_ticket({
      token_id: token.token_id,
      from_subaccount: [],
      target_chain_id: targetChainId,
      amount,
      receiver: targetAddr,
    });

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
    const spender = Principal.fromText(icpChainCanisterId);
    console.log("spender", spender);
    const account = Principal.fromText(sourceAddr);
    console.log("account", account);
    const { allowance, transactionFee } = IcrcLedgerCanister.create({
      canisterId: Principal.fromText(token.id),
    });
    // check allowance
    const txFee = await transactionFee({ certified: false });
    console.log("txFee", txFee);
    const approvingAmount = amount + txFee;
    console.log("approvingAmount", approvingAmount);
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
    // approve
    const icrcLedger: IcrcLedgerService = await createActor<IcrcLedgerService>(
      token.id,
      IcrcLedgerInterfaceFactory
    );

    if (allowanceAmount < approvingAmount) {
      console.log("approve");
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
    const [redeemFee] = await this.actor.get_redeem_fee(targetChainId);
    console.log("redeemFee", redeemFee);
    if (redeemFee === undefined) {
      throw new Error("Redeem fee not set");
    }
    const feeAccountArray = await this.actor.get_fee_account([account]);
    console.log("feeAccountArray", feeAccountArray);
    const lc = LedgerCanister.create();

    const feeAccount = Array.from(feeAccountArray)
      .map((i) => ("0" + i.toString(16)).slice(-2))
      .join("");
    const redeemAccountBalance = await lc.accountBalance({
      accountIdentifier: feeAccount,
      certified: false,
    });
    // deposit redeem fee
    console.log("redeemAccountBalance", redeemAccountBalance);
    console.log("redeemFee", redeemFee);
    if (redeemAccountBalance < redeemFee) {
      const depositAmount = redeemFee - redeemAccountBalance;
      // check balance
      const myIcpBalance = await lc.accountBalance({
        accountIdentifier: AccountIdentifier.fromPrincipal({
          principal: account,
        }),
        certified: false,
      });
      console.log("myIcpBalance", myIcpBalance);
      console.log("depositAmount", depositAmount);
      if (depositAmount >= myIcpBalance) {
        throw new Error("Insufficient balance");
      }
      // deposit
      await transfer({
        to: feeAccount,
        amount: depositAmount,
      });
    }
  }
}
