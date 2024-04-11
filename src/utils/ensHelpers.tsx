import makeBlockie from "ethereum-blockies-base64";
import { type Address, type Client, type Hex, isAddress } from "viem";
import { getEnsAddress, getEnsAvatar, getEnsName, normalize } from "viem/ens";

export const getName = async (client: Client, address: Hex) => {
  try {
    const name = await getEnsName(client, { address });
    return name ? name : undefined;
  } catch (error) {
    console.error("ENS name lookup error", error);
  }
};

export const getAvatar = async (
  client: Client,
  name: string,
  address: string,
) => {
  try {
    const background_image = await getEnsAvatar(client, { name });
    return !!background_image ? background_image : makeBlockie(address);
  } catch (error) {
    console.error("ENS avatar lookup error", error);
  }
};

export const getAddress = async (client: Client, name: string) => {
  try {
    const address = await getEnsAddress(client, {
      name: normalize(name),
    });
    return (address ? address.toLocaleLowerCase() : undefined) as
      | Address
      | undefined;
  } catch (error) {
    console.error("ENS address lookup error", error);
  }
};

export const isEnsName = (address: string) => !isAddress(address);

export const ENS_TTL = 60 * 60 * 24; // 1 day
