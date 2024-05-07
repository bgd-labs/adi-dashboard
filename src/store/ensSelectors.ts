import dayjs from "dayjs";
import { type Address } from "viem";

import { type EnsDataItem, ENSProperty } from "@/store/ensSlice";
import { ENS_TTL } from "@/utils/ensHelpers";

export const ENSDataExists = (
  ensData: Record<`0x${string}`, EnsDataItem>,
  address: Address,
  property: ENSProperty,
) => {
  const lowercasedAddress = address.toLocaleLowerCase() as Address;
  return Boolean(ensData[lowercasedAddress]?.[property]);
};

export const ENSDataHasBeenFetched = (
  ensData: Record<`0x${string}`, EnsDataItem>,
  address: Address,
  property: ENSProperty,
) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
  const currentTime = dayjs().unix();
  const fetchTime = ensData[address]?.fetched?.[property];
  if (!fetchTime) return false;

  return currentTime - fetchTime <= ENS_TTL;
};

export const selectENSAvatar = async ({
  fetchEnsAvatarByAddress,
  ensData,
  address,
  setAvatar,
  setIsAvatarExists,
}: {
  fetchEnsAvatarByAddress: (address: Address, name?: string) => Promise<void>;
  ensData: Record<`0x${string}`, EnsDataItem>;
  address: Address;
  setAvatar: (value: string | undefined) => void;
  setIsAvatarExists: (value: boolean | undefined) => void;
}) => {
  const lowercasedAddress = address.toLocaleLowerCase() as Address;
  const ENSData = ensData[lowercasedAddress];

  if (ENSData?.name) {
    await fetchEnsAvatarByAddress(address, ENSData.name).then(() => {
      setAvatar(
        ENSDataExists(ensData, address, ENSProperty.AVATAR)
          ? ensData[lowercasedAddress]?.avatar?.url
          : undefined,
      );
      setIsAvatarExists(ensData[lowercasedAddress]?.avatar?.isExists);
    });
  } else {
    setAvatar(undefined);
    setIsAvatarExists(false);
  }
};

