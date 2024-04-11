// TODO: I think this logic should be on the trpc side and ensData should stored in the database

import dayjs from "dayjs";
import { produce } from "immer";
import { type Address } from "viem";
import { mainnet } from "viem/chains";

import { ENSDataHasBeenFetched } from "@/store/ensSelectors";
import { type StoreSliceWithClients } from "@/store/index";
import { getAddress, getAvatar, getName } from "@/utils/ensHelpers";
import {
  getLocalStorageEnsAddresses,
  setLocalStorageEnsAddresses,
} from "@/utils/localStorage";

export enum ENSProperty {
  NAME = "name",
  AVATAR = "avatar",
}

export type EnsDataItem = {
  name?: string;
  avatar?: {
    url?: string;
    isExists?: boolean;
  };
  fetched?: {
    name?: number;
    avatar?: number;
  };
};

export interface IEnsSlice {
  ensData: Record<Address, EnsDataItem>;
  addressesNameInProgress: Record<string, boolean>;
  addressesAvatarInProgress: Record<string, boolean>;

  initEns: () => void;
  setEns: (ens: Record<string, EnsDataItem>) => void;
  setProperty: (
    address: Address,
    property: ENSProperty,
    value?: string,
    isExists?: boolean,
  ) => void;

  fetchEnsNameByAddress: (address: Address) => Promise<void>;
  fetchEnsAvatarByAddress: (address: Address, name?: string) => Promise<void>;
  fetchAddressByEnsName: (name: string) => Promise<Address | undefined>;
}

export const createEnsSlice: StoreSliceWithClients<IEnsSlice> = (
  set,
  get,
  clients,
) => ({
  ensData: {},
  addressesNameInProgress: {},
  addressesAvatarInProgress: {},

  initEns: () => {
    const ens = getLocalStorageEnsAddresses();
    if (ens) {
      set((state) =>
        produce(state, (draft) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const parsedEns: Record<Address, EnsDataItem> = JSON.parse(ens);
          for (const key in parsedEns) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            draft.ensData[key as Address] = parsedEns[key as Address];
          }
        }),
      );
    }
  },
  setEns: (ens) => {
    set((state) =>
      produce(state, (draft) => {
        for (const key in ens) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          draft.ensData[key as Address] = ens[key];
        }
      }),
    );
    setLocalStorageEnsAddresses(get().ensData);
  },
  setProperty: (address, property, value, isExists) => {
    set((state) =>
      produce(state, (draft) => {
        const currentEntry = draft.ensData[address] ?? {};

        if (property === ENSProperty.AVATAR) {
          currentEntry[property] = { url: value, isExists };
        } else {
          currentEntry[property] = value;
        }

        currentEntry.fetched = currentEntry.fetched ?? {};
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
        currentEntry.fetched[property] = dayjs().unix();
        draft.ensData[address] = currentEntry;
      }),
    );
    setTimeout(() => setLocalStorageEnsAddresses(get().ensData), 1);
  },

  fetchEnsNameByAddress: async (address) => {
    const lowercasedAddress = address.toLocaleLowerCase() as Address;
    // check if already exist or pending
    if (
      ENSDataHasBeenFetched(
        get().ensData,
        lowercasedAddress,
        ENSProperty.NAME,
      ) ||
      get().addressesNameInProgress[lowercasedAddress]
    ) {
      return;
    }

    set((state) =>
      produce(state, (draft) => {
        draft.addressesNameInProgress[lowercasedAddress] = true;
      }),
    );

    const mainnetClient = clients[mainnet.id];

    if (mainnetClient) {
      const name = await getName(mainnetClient, lowercasedAddress);
      set((state) =>
        produce(state, (draft) => {
          delete draft.addressesNameInProgress[lowercasedAddress];
        }),
      );
      get().setProperty(lowercasedAddress, ENSProperty.NAME, name);
    }
  },
  fetchEnsAvatarByAddress: async (address, name) => {
    const lowercasedAddress = address.toLocaleLowerCase() as Address;
    // check if already exist or pending
    if (
      (ENSDataHasBeenFetched(
        get().ensData,
        lowercasedAddress,
        ENSProperty.AVATAR,
      ) ||
        get().addressesAvatarInProgress[lowercasedAddress]) ??
      !name
    ) {
      return;
    }

    set((state) =>
      produce(state, (draft) => {
        draft.addressesAvatarInProgress[lowercasedAddress] = true;
      }),
    );

    const mainnetClient = clients[mainnet.id];

    if (mainnetClient) {
      const avatar = await getAvatar(mainnetClient, name, address);
      let isExists: boolean | undefined = undefined;

      if (avatar) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const avatarResponseStatus = (await fetch(avatar)).status;
        isExists = avatarResponseStatus === 200;
      }

      set((state) =>
        produce(state, (draft) => {
          delete draft.addressesAvatarInProgress[lowercasedAddress];
        }),
      );

      get().setProperty(
        lowercasedAddress,
        ENSProperty.AVATAR,
        avatar,
        isExists,
      );
    }
  },
  fetchAddressByEnsName: async (name) => {
    const address =
      (Object.keys(get().ensData).find(
        (address) =>
          get().ensData[address.toLocaleLowerCase() as Address]?.name === name,
      ) as Address) || undefined;

    if (address) {
      return address;
    }

    set((state) =>
      produce(state, (draft) => {
        draft.addressesNameInProgress[name] = true;
      }),
    );

    const mainnetClient = clients[mainnet.id];

    if (mainnetClient) {
      const addressFromEns = await getAddress(mainnetClient, name);

      set((state) =>
        produce(state, (draft) => {
          delete draft.addressesNameInProgress[name];
        }),
      );

      if (addressFromEns) {
        get().setProperty(
          addressFromEns.toLocaleLowerCase() as Address,
          ENSProperty.NAME,
          name,
        );
        return addressFromEns;
      }
    }
    return;
  },
});
