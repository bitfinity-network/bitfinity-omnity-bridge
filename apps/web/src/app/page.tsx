"use client";

import { ChainID } from "@bitfinity/bridge";
import { IDL } from "@dfinity/candid";
import { ICBridge } from "@bitfinity/bridge/src/ICBridge";
import React from "react";

function generateRandomBigInt32() {
  return Math.floor(Math.random() * Math.pow(2, 32));
}
const testCreatActor = async (
  canisterId: string,
  interfaceFactory: IDL.InterfaceFactory
) => {
  await (window as any).ic.plug?.requestConnect({
    whitelist: [canisterId],
  });
  const agent = (window as any).ic?.plug?.agent;
  return (window as any).ic?.plug?.createActor({
    interfaceFactory,
    canisterId: canisterId,
    agent,
  });
};

const testTransfer = async (params: { to: string; amount: bigint }) => {
  const result = await (window as any).ic.plug?.requestTransfer({
    to: params.to,
    amount: Number(params.amount.toString()),
  });
  console.log("transfer result", result);
  return result?.height;
};

export default function Home() {
  const [ticketIdInput, setTicketIdInput] = React.useState<string>("");

  const testParams = {
    sourceAddr:
      "nizq7-3pdix-fdqim-arhfb-q2pvf-n4jpk-uukgm-enmpy-hebkc-dw3fc-3ae",
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
    },
    amount: BigInt(100000),
    createActor: testCreatActor,
    transfer: testTransfer,
    feeRate: 10000,
    targetChainId: ChainID.Bitfinity,
  };

  const handleTransfer = async () => {
    const icBridge = new ICBridge();
    try {
      const res = await icBridge.onBridge(testParams);
      console.log("Ticket ID:", res);
    } catch (error) {
      console.error("error", error);
    }
  };

  const handleCheckStatus = async () => {
    if (!ticketIdInput.trim()) {
      alert("Please enter a ticket ID");
      return;
    }

    const icBridge = new ICBridge();
    try {
      const status = await icBridge.checkMintStatus(ticketIdInput);
      alert(`Bridge Status: ${status}`);
    } catch (error) {
      console.error("Status check failed:", error);
      alert("Failed to check status");
    }
  };

  return (
    <main className="min-h-screen p-8 bg-secondary-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-secondary-900">
          Bridge to Bitfinity
        </h1>
        <div className="flex flex-col gap-4 items-center">
          <button
            onClick={handleTransfer}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Transfer CHAT
          </button>

          <div className="flex gap-2 items-center mt-4">
            <input
              type="text"
              value={ticketIdInput}
              onChange={(e) => setTicketIdInput(e.target.value)}
              placeholder="Enter Ticket ID"
              className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleCheckStatus}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Check Status
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
