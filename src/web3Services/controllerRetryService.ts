import { type Config, writeContract } from "@wagmi/core";
import { type Address, type Hex } from 'viem';

import { cccAbi}  from '@/web3Services/abi/crossChainControllerAbi';
import { type ClientsRecord } from '@bgd-labs/frontend-web3-utils';

export type RetryEnvelopeTxParams = {
  chainId: number;
  cccAddress: Address;
  envelope: {
    nonce: bigint;
    origin: Address;
    destination: Address;
    originChainId: bigint;
    destinationChainId: bigint;
    message: Address;
  },
  gasLimit: bigint;
};

export type RetryTransactionTxParams = {
  chainId: number;
  cccAddress: Address;
  encodedTransaction: Hex;
  gasLimit: bigint;
  bridgeAdaptersToRetry: Address[];
};

export class ControllerRetryService {
  wagmiConfig: Config | undefined = undefined;
  private clients: ClientsRecord;

  constructor(clients: ClientsRecord) {
    this.clients = clients;
  }

  public connectSigner(wagmiConfig: Config) {
    this.wagmiConfig = wagmiConfig;
  }

  async retryEnvelope({ chainId, cccAddress, envelope, gasLimit }: RetryEnvelopeTxParams) {
    if (this.wagmiConfig) {
      return writeContract(this.wagmiConfig, {
        abi: cccAbi,
        address: cccAddress,
        functionName: 'retryEnvelope',
        args: [envelope, gasLimit],
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
    bridgeAdaptersToRetry
  }: RetryTransactionTxParams) {
    if (this.wagmiConfig) {
      return writeContract(this.wagmiConfig, {
        abi: cccAbi,
        address: cccAddress,
        functionName: 'retryTransaction',
        args: [encodedTransaction, gasLimit, bridgeAdaptersToRetry],
        chainId: chainId,
      });
    } else {
      throw new Error("Connect wallet before process transaction");
    }
  }
}
