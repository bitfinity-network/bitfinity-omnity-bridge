"use client";

import { useState, useEffect } from "react";
import { IcBitfinityBridge } from "@bitfinity/bridge";
import { defineChain } from "viem";

const bitfinity = defineChain({
  id: 355113,
  name: "Bitfinity Testnet",
  network: "bitfinity-testnet",
  nativeCurrency: {
    decimals: 18,
    name: "BFT",
    symbol: "BFT",
  },
  rpcUrls: {
    default: { http: ["https://testnet.bitfinity.network"] },
  },
  blockExplorers: {
    default: { name: "Explorer", url: "https://explorer.bitfinity.network" },
  },
  testnet: true,
});

const IC_TOKENS = [
  { symbol: "ICP", name: "Internet Computer", decimals: 8 },
  { symbol: "ckBTC", name: "Chain-key Bitcoin", decimals: 8 },
  { symbol: "ICRC", name: "ICRC Token", decimals: 8 },
  { symbol: "XDR", name: "Chat Token", decimals: 8 },
] as const;

export function BridgeForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [selectedToken, setSelectedToken] =
    useState<(typeof IC_TOKENS)[number]["symbol"]>("ICP");
  const [bridge, setBridge] = useState<IcBitfinityBridge | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const bridgeInstance = new IcBitfinityBridge({
        chainId: "355113",
        canisterId: process.env.NEXT_PUBLIC_OMNITY_CANISTER_ID!,
        evmChain: bitfinity,
        portContractAddress: process.env.NEXT_PUBLIC_OMNITY_PORT_CONTRACT!,
      });
      setBridge(bridgeInstance);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bridge) return;

    setError(null);
    setLoading(true);

    try {
      console.log("Bridging", { amount, selectedToken });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400"></div>
          <span className="text-sm font-medium text-gray-600">IC</span>
        </div>
        <svg
          className="w-4 h-4 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 7l5 5m0 0l-5 5m5-5H6"
          />
        </svg>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">Bitfinity</span>
          <div className="w-2 h-2 rounded-full bg-green-400"></div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <select
          value={selectedToken}
          onChange={(e) =>
            setSelectedToken(
              e.target.value as (typeof IC_TOKENS)[number]["symbol"],
            )
          }
          className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          {IC_TOKENS.map((token) => (
            <option key={token.symbol} value={token.symbol}>
              {token.symbol} - {token.name}
            </option>
          ))}
        </select>

        <div className="relative">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            step="any"
            min="0"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
            {selectedToken}
          </span>
        </div>

        <button
          type="submit"
          disabled={loading || !amount || !bridge}
          className="w-full bg-primary-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Processing...</span>
            </div>
          ) : (
            `Bridge ${selectedToken} to Bitfinity`
          )}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
