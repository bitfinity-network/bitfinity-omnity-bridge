import { ActorSubclass } from "@dfinity/agent";
import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  getContract,
  type PublicClient,
  type WalletClient,
} from "viem";
import type { Chain, OnBridgeParams } from "./types";
import { OMNITY_PORT_ABI } from "./constants";
import { idlFactory, _SERVICE } from "./candids/Omnity.did";
import { createActor } from "./utils";

type EvmAddress = `0x${string}`;

export class BitfinityBridge {
  private actor: ActorSubclass<_SERVICE>;
  private chain: Chain;
  private publicClient: PublicClient;
  private walletClient: WalletClient;

  constructor(chain: Chain) {
    this.chain = chain;

    this.actor = createActor<_SERVICE>(chain.canisterId, idlFactory);

    this.publicClient = createPublicClient({
      chain: chain.evmChain,
      transport: http(),
    });

    this.walletClient = createWalletClient({
      chain: chain.evmChain,
      transport: custom((window as any).ethereum),
    });
  }

  async bridgeToICPCustom(params: {
    tokenId: string;
    sourceAddr: string;
    targetAddr: string;
    amount: bigint;
    targetChainId: string;
  }): Promise<string> {
    const { tokenId, sourceAddr, targetAddr, amount, targetChainId } = params;

    const portContractAddr = this.chain.contractAddress;
    if (!portContractAddr) {
      throw new Error("Missing port contract address");
    }

    const portContract = getContract({
      address: portContractAddr as EvmAddress,
      abi: OMNITY_PORT_ABI,
      client: {
        public: this.publicClient,
        wallet: this.walletClient,
      },
    });

    try {
      const [fee] = await this.actor.get_fee(targetChainId);

      console.log("Bridge Transaction Details:", {
        chain: this.chain.evmChain,
        targetChainId,
        sourceAddr,
        tokenId,
        targetAddr,
        amount,
        fee,
        portContractAddr,
      });

      const txHash = await portContract.write.redeemToken(
        [tokenId, targetAddr, amount],
        {
          account: sourceAddr as EvmAddress,
          chain: this.chain.evmChain,
          value: fee,
        }
      );

      return txHash;
    } catch (error) {
      console.error("Bridge Transaction Failed:", error);
      if (error instanceof Error) {
        throw new Error(`Bridge transaction failed: ${error.message}`);
      }
      throw error;
    }
  }
}
