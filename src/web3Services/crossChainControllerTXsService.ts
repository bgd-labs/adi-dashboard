import { type Config, writeContract } from "@wagmi/core";
import { type Address, type Hex } from "viem";

import { cccAbi } from "@/web3Services/abi/crossChainControllerAbi";

export type RetryEnvelopeTxParams = {
  chainId: number;
  cccAddress: Address;
  envelope: {
    nonce: number;
    origin: Address;
    destination: Address;
    originChainId: number;
    destinationChainId: number;
    message: Address;
  };
  gasLimit: number;
};

export type RetryTransactionTxParams = {
  chainId: number;
  cccAddress: Address;
  encodedTransaction: Hex;
  gasLimit: number;
  bridgeAdaptersToRetry: Address[];
};

export class CrossChainControllerTXsService {
  wagmiConfig: Config | undefined = undefined;

  public connectSigner(wagmiConfig: Config) {
    this.wagmiConfig = wagmiConfig;
  }

  async retryEnvelope({
    chainId,
    cccAddress,
    envelope,
    gasLimit,
  }: RetryEnvelopeTxParams) {
    if (this.wagmiConfig) {
      return writeContract(this.wagmiConfig, {
        abi: cccAbi,
        address: cccAddress,
        functionName: "retryEnvelope",
        args: [
          {
            ...envelope,
            nonce: BigInt(envelope.nonce),
            originChainId: BigInt(envelope.originChainId),
            destinationChainId: BigInt(envelope.destinationChainId),
          },
          BigInt(gasLimit),
        ],
        chainId: chainId,
      });
    } else {
      throw new Error("Connect wallet before process transaction");
    }
  }

  async retryTransaction({
    chainId,
    cccAddress,
    encodedTransaction,
    gasLimit,
    bridgeAdaptersToRetry,
  }: RetryTransactionTxParams) {
    if (this.wagmiConfig) {
      return writeContract(this.wagmiConfig, {
        abi: cccAbi,
        address: cccAddress,
        functionName: "retryTransaction",
        args: [encodedTransaction, BigInt(gasLimit), bridgeAdaptersToRetry],
        chainId: chainId,
      });
    } else {
      throw new Error("Connect wallet before process transaction");
    }
  }
}
