import { getClients } from "@/server/eventCollection/getClients";
import { getCrossChainControllers } from "@/server/eventCollection/getCrossChainControllers";
import { type Hash, getContract } from "viem";

const CHAIN_ID_TO_LINK_CONTRACT: Record<number, string> = {
  1: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
  137: "0xb0897686c545045aFc77CF20eC7A532E3120E0F1",
  43114: "0x5947BB275c521040051D82396192181b413227A3",
};

const LINK_TOKEN_ABI = [
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
];

export const getBalance = async ({
  address,
  chainId,
}: {
  address: Hash;
  chainId: number;
}) => {
  const crossChainControllers = await getCrossChainControllers();
  const clients = await getClients({ crossChainControllers });
  const client = clients[chainId];
  if (!client) return;

  const linkContract = getContract({
    address: CHAIN_ID_TO_LINK_CONTRACT[chainId] as Hash,
    abi: LINK_TOKEN_ABI,
    client: client,
  });

  let linkBalance: bigint | null = null;

  if (linkContract?.read?.balanceOf) {
    linkBalance = (await linkContract.read.balanceOf([address])) as bigint;
  }

  const balance = await client.getBalance({
    address: address,
  });
  return { chain_id: chainId, balance, linkBalance };
};
