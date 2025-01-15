import { useState, useEffect } from "react";
import { IcBitfinityBridge } from "@bitfinity/bridge";
import type { BitfinityChain, Token, BridgeTicket } from "@bitfinity/bridge";
import { mainnet } from "viem/chains";

const bitfinityChain: BitfinityChain = {
  chainId: "1",
  canisterId: "pw3ee-pyaaa-aaaar-qahva-cai",
  evmChain: mainnet,
  portContractAddress: "0x1Ad8cec9E5a4A441FE407785E188AbDeb4371468",
};

export default function BridgeTest() {
  const [bridge, setBridge] = useState<IcBitfinityBridge | null>(null);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [sourceAddress, setSourceAddress] = useState("");
  const [targetAddress, setTargetAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [bridgeFee, setBridgeFee] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [ticketId, setTicketId] = useState("");

  useEffect(() => {
    const initBridge = () => {
      const bridgeInstance = new IcBitfinityBridge(bitfinityChain);
      setBridge(bridgeInstance);
    };
    initBridge();
  }, []);

  useEffect(() => {
    const loadTokens = async () => {
      if (bridge) {
        const tokenList = await bridge.getTokenList();
        console.log("tokenList", tokenList);
        setTokens(tokenList);
      }
    };
    loadTokens();
  }, [bridge]);

  useEffect(() => {
    const loadBridgeFee = async () => {
      if (bridge) {
        const fee = await bridge.getBridgeFee();
        setBridgeFee(fee.fee.toString());
      }
    };
    loadBridgeFee();
  }, [bridge]);

  const handleBridge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bridge || !selectedToken) return;

    try {
      const txHash = await bridge.bridgeToEvm({
        token: selectedToken,
        sourceIcAddress: sourceAddress,
        targetEvmAddress: targetAddress,
        amount: BigInt(amount),
      });
      setStatus(`Bridge initiated. Transaction hash: ${txHash}`);
    } catch (error) {
      setStatus(
        `Error: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  };

  const checkStatus = async () => {
    if (!bridge || !ticketId) return;

    try {
      const result = await bridge.getBridgeStatus({
        ticketId,
        tokenId: selectedToken?.tokenId || "",
      });
      setStatus(
        `Status: ${result.status}${result.evmTxHash ? ` - TX: ${result.evmTxHash}` : ""}`
      );
    } catch (error) {
      setStatus(
        `Error checking status: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Bridge Test Interface</h1>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Available Tokens</h2>
        <select
          className="w-full p-2 border rounded"
          onChange={(e) => setSelectedToken(tokens[parseInt(e.target.value)])}
        >
          <option value="">Select a token</option>
          {tokens.map((token, index) => (
            <option key={token.tokenId} value={index}>
              {token.symbol} - {token.name}
            </option>
          ))}
        </select>
      </div>

      <form onSubmit={handleBridge} className="space-y-4">
        <div>
          <label className="block mb-1">Source IC Address:</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={sourceAddress}
            onChange={(e) => setSourceAddress(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-1">Target EVM Address:</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={targetAddress}
            onChange={(e) => setTargetAddress(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-1">Amount:</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        <div className="text-sm text-gray-600">
          Bridge Fee: {bridgeFee}{" "}
          {bitfinityChain.evmChain.nativeCurrency.symbol}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Bridge Token
        </button>
      </form>

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-3">Check Bridge Status</h2>
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 p-2 border rounded"
            placeholder="Enter ticket ID"
            value={ticketId}
            onChange={(e) => setTicketId(e.target.value)}
          />
          <button
            onClick={checkStatus}
            className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
          >
            Check Status
          </button>
        </div>
      </div>

      {status && (
        <div className="mt-6 p-4 bg-gray-100 rounded">
          <h2 className="font-semibold mb-2">Status:</h2>
          <pre className="whitespace-pre-wrap">{status}</pre>
        </div>
      )}
    </div>
  );
}
