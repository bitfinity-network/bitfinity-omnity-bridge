"use client";

import { ChainID } from "@bitfinity/bridge";
import { IDL } from "@dfinity/candid";
import { ICBridge } from "@bitfinity/bridge/src/ICBridge";
import { idlFactory as LedgerInterfaceFactory } from "../candids/ledger.did";

const LEDGER_CANISTER_ID = "ryjl3-tyaaa-aaaaa-aaaba-cai";

function generateRandomBigInt32() {
  return Math.floor(Math.random() * Math.pow(2, 32));
}
const testCreatActor = async (
  canisterId: string,
  interfaceFactory: IDL.InterfaceFactory
) => {
  const bitfinityWallet =
    typeof window !== "undefined" ? (window as any).ic.bitfinityWallet : null;
  await bitfinityWallet?.requestConnect({
    whitelist: [canisterId],
  });
  return bitfinityWallet?.createActor({
    interfaceFactory,
    canisterId: canisterId,
  });
};

const testTransfer = async (params: { to: string; amount: bigint }) => {
  let blockHeight;
  const TRANSFER_ICP_TX = {
    idl: LedgerInterfaceFactory,
    canisterId: LEDGER_CANISTER_ID,
    methodName: "send_dfx",
    args: [
      {
        to: params.to,
        fee: { e8s: BigInt(10000) },
        amount: { e8s: BigInt(params.amount) },
        memo: generateRandomBigInt32(),
        from_subaccount: [],
        created_at_time: [],
      },
    ],
    onSuccess: async (res: any) => {
      console.log("transferred icp successfully", res);
      blockHeight = res;
    },
    onFail: (res: any) => {
      console.log("transfer icp error", res);
    },
  };
  (await typeof window) !== "undefined" &&
    (window as any).ic.bitfinityWallet.batchTransactions([TRANSFER_ICP_TX]);
  return blockHeight;
};

export default function Home() {
  const testParams = {
    sourceAddr:
      "23sxj-6olsu-k5j3r-3pmct-kkfux-luwuc-r52uf-c5nv4-277xn-fhfuo-6ae",
    targetAddr: "0xeE94DaC8671a74F8DC8D90AEA63F1D1fEDb8C3d3",
    token: {
      balance: BigInt(0),
      chain_id: ChainID.sICP,
      decimals: 8,
      fee: BigInt(100000),
      icon: "https://raw.githubusercontent.com/octopus-network/omnity-interoperability/9061b7e2ea9e0717b47010279ff1ffd6f1f4c1fc/assets/token_logo/icp.svg",
      id: "2ouva-viaaa-aaaaq-aaamq-cai",
      name: "CHAT",
      symbol: "CHAT",
      token_id: "sICP-icrc-CHAT",
      createActor: testCreatActor,
      transfer: testTransfer,
    },
    amount: 1000000000000000000n,
    feeRate: 10000,
    targetChainId: ChainID.Bitfinity,
  };

  const handleTransfer = async () => {
    const icBridge = new ICBridge();
    try {
      const res = await icBridge.onBridge(testParams);
      console.log("res", res);
    } catch (error) {
      console.error("error", error);
    }
  };
  return (
    <main className="min-h-screen p-8 bg-secondary-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-secondary-900">
          Bridge to Bitfinity
        </h1>
        <button onClick={handleTransfer}>Transfer CHAT</button>
      </div>
    </main>
  );
}
