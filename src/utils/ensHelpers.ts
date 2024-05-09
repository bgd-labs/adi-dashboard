import makeBlockie from "ethereum-blockies-base64";
import { type Client, type Hex } from "viem";
import { getEnsAvatar, getEnsName } from "viem/ens";

export const ENS_TTL = 60 * 60 * 24;

export type EnsDataItem = {
  address: string;
  lastUpdated: Date | null;
  name: string | null;
  avatar: string | null;
};

export const getName = async (client: Client, address: Hex) => {
  try {
    const name = await getEnsName(client, { address });
    return name ? name : undefined;
  } catch (error) {
    console.error("ENS name lookup error", error);
  }
};

export const getAvatar = async (client: Client, name: string) => {
  try {
    const background_image = await getEnsAvatar(client, { name });
    if (!!background_image && (await fetch(background_image)).status === 200) {
      return background_image;
    } else {
      return undefined;
    }
  } catch (error) {
    console.error("ENS avatar lookup error", error);
  }
};

export const hasENSDataExpired = (ensData: EnsDataItem) => {
  const currentTime = Date.now();
  const lastUpdatedTime = ensData?.lastUpdated?.getTime();
  if (!lastUpdatedTime) return true;
  return currentTime - lastUpdatedTime > ENS_TTL;
};

export const checkAvatar = ({
  avatar,
  walletAddress,
}: {
  avatar?: string;
  walletAddress: string;
}) =>
  !!avatar
    ? avatar
    : makeBlockie(walletAddress !== "" ? walletAddress : "default");
