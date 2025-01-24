"use client";

import { ChainID, BitfinityBridge, Token, Chain } from "@bitfinity/bridge";
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
  const [tokens, setTokens] = React.useState<Array<Token>>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    setLoading(true);
    try {
      const icBridge = new ICBridge();
      const tokenList = await icBridge.getTokenList();
      setTokens(tokenList);
    } catch (error) {
      console.error("Failed to fetch tokens:", error);
    } finally {
      setLoading(false);
    }
  };

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
      id: "zfcdd-tqaaa-aaaaq-aaaga-cai",
      name: "Dragginz",
      symbol: "DKP",
      token_id: "sICP-icrc-DKP",
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

  const handleBitfinityToICPCustoms = async () => {
    const chain: Chain = {
      canisterId: "pw3ee-pyaaa-aaaar-qahva-cai",
      evmChain: {
        id: 355110,
        name: "Bitfinity",
        nativeCurrency: {
          name: "Bitfinity",
          symbol: "BTF",
          decimals: 18,
        },
        rpcUrls: {
          default: {
            http: ["https://explorer.mainnet.bitfinity.network"],
          },
        },
      },
      contractAddress: "0x1Ad8cec9E5a4A441FE407785E188AbDeb4371468",
    };
    const bitfinityBridge = new BitfinityBridge(chain);
    const res = await bitfinityBridge.bridgeToICPCustom({
      tokenId: "sICP-icrc-DKP",
      sourceAddr: "0xeE94DaC8671a74F8DC8D90AEA63F1D1fEDb8C3d3",
      targetAddr:
        "nizq7-3pdix-fdqim-arhfb-q2pvf-n4jpk-uukgm-enmpy-hebkc-dw3fc-3ae",
      amount: BigInt(10000000),
      targetChainId: ChainID.sICP,
    });
    console.log("res", res);
  };

  return (
    <main className="min-h-screen p-8 bg-secondary-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-secondary-900">
          Bridge to Bitfinity
        </h1>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Available Tokens</h2>
          {loading ? (
            <div className="text-center">Loading tokens...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tokens.map((token) => (
                <div
                  key={token.token_id}
                  className="p-4 border rounded-lg bg-white shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    {token.icon && token.icon.length > 0 && (
                      <img
                        src={token.icon[0]}
                        alt={token.symbol}
                        className="w-8 h-8"
                      />
                    )}
                    <div>
                      <h3 className="font-medium">{token.name}</h3>
                      <p className="text-sm text-gray-600">{token.symbol}</p>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    <p>Decimals: {token.decimals}</p>
                    <p className="truncate">ID: {token.token_id}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 items-center">
          <button
            onClick={handleTransfer}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Transfer CHAT
          </button>
          <button
            onClick={handleBitfinityToICPCustoms}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Bitfinity to ICP customs
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
