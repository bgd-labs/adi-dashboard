import * as chains from "viem/chains";

export const getChainName = (chainId: number) => {
  const chain = Object.values(chains).find((chain) => chain.id === chainId);

  if (!chain) {
    throw new Error(`Chain with id ${chainId} is not supported by viem.`);
  }

  return chain.name;
};
