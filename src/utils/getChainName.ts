export const chainsNames: Record<number, string> = {
  "1": "Ethereum",
  "10": "OP Mainnet",
  "56": "BNB Smart Chain",
  "100": "Gnosis",
  "137": "Polygon",
  "250": "Fantom",
  "324": "zkSync Era",
  "420": "Optimism Testnet",
  "1088": "Metis",
  "1101": "Polygon zkEVM",
  "4002": "Fantom Testnet",
  "8453": "Base",
  "42161": "Arbitrum",
  "42220": "Celo",
  "43113": "Avalanche Testnet",
  "43114": "Avalanche",
  "59141": "Linea Sepolia",
  "59144": "Linea",
  "80001": "Mumbai",
  "84532": "Base sepolia testnet",
  "421613": "Arbitrum Goerli",
  "421614": "Arbitrum Sepolia",
  "534351": "Scroll Testnet",
  "534352": "Scroll",
  "11155111": "Sepolia",
  "1666600000": "Harmony One",
};

export function getChainName(chainId: number): string | undefined {
  return chainsNames[chainId];
}
