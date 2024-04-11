import { type Address } from "viem";
import * as chains from "viem/chains";

export const getScanLink = ({
  chainId = chains.mainnet.id,
  address,
  type = "address",
}: {
  chainId?: number;
  address: Address;
  type?: "address" | "tx";
}) => {
  const chain = Object.values(chains).find((chain) => chain.id === chainId);
  return `${chain?.blockExplorers?.default.url}/${type}/${address}`;
};
