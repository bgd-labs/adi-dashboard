// import { writeContract } from "@wagmi/core";
import { type Client, getContract, type Hex } from "viem";
import { type Config } from "wagmi";

import { cccAbi } from "./crossChainControllerAbi";

export class CounterDataService {
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

  // TODO: add retry methods
}
