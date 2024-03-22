import { writeContract } from "@wagmi/core";
import { type Client, getContract, type Hex } from "viem";
import { type Config } from "wagmi";

import { cccAbi } from "./crossChainControllerAbi";
import {DESIRED_CHAIN_ID} from '@/web3/store/web3Slice';

export class ControllerRetryService {
  private controllerFactory;
  private client: Client;
  private wagmiConfig: Config | undefined = undefined;

  constructor(client: Client, address: Hex) {
    this.client = client;
    this.controllerFactory = getContract({
      address,
      abi: cccAbi,
      client: client,
    });
  }

  public connectSigner(wagmiConfig: Config) {
    this.wagmiConfig = wagmiConfig;
  }

  // TODO: need add parameters and args to tx's

  async retryEnvelope() {
    if (this.wagmiConfig) {
      return writeContract(this.wagmiConfig, {
        abi: this.controllerFactory.abi,
        address: this.controllerFactory.address,
        functionName: 'retryEnvelope',
        args: [],
        chainId: DESIRED_CHAIN_ID,
      });
    }
    return undefined;
  }

  async retryTransaction() {
    if (this.wagmiConfig) {
      return writeContract(this.wagmiConfig, {
        abi: this.controllerFactory.abi,
        address: this.controllerFactory.address,
        functionName: 'retryTransaction',
        args: [],
        chainId: DESIRED_CHAIN_ID,
      });
    }
    return undefined;
  }
}
