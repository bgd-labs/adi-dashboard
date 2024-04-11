import {
  selectAllTransactionsByWallet,
  selectPendingTransactionByWallet,
  TransactionStatus,
} from "@bgd-labs/frontend-web3-utils";
import dayjs from "dayjs";
import makeBlockie from "ethereum-blockies-base64";
import React, { useEffect, useState } from "react";
import { type Address, zeroAddress } from "viem";
import { mainnet } from "viem/chains";

import { ChainIcon } from "@/components/ChainIcon";
import { Link } from "@/components/Link";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/Modal";
import { Spinner } from "@/components/Spinner";
import { useStore } from "@/providers/ZustandStoreProvider";
import { selectENSAvatar } from "@/store/ensSelectors";
import { cn } from "@/utils/cn";
import { getScanLink } from "@/utils/getScanLink";
import { textCenterEllipsis } from "@/utils/textCenterEllipsis";
import { getChainName } from '@/utils/getChainName';

export const WalletActive = () => {
  const activeWallet = useStore((store) => store.activeWallet);
  const disconnectActiveWallet = useStore(
    (store) => store.disconnectActiveWallet,
  );
  const walletConnectedTimeLock = useStore(
    (store) => store.walletConnectedTimeLock,
  );
  const ensData = useStore((store) => store.ensData);
  const fetchEnsNameByAddress = useStore(
    (store) => store.fetchEnsNameByAddress,
  );
  const fetchEnsAvatarByAddress = useStore(
    (store) => store.fetchEnsAvatarByAddress,
  );

  const activeAddress = activeWallet?.address ?? "";

  const allTxsFromStore = useStore((store) =>
    selectAllTransactionsByWallet(
      store.transactionsPool,
      activeAddress || zeroAddress,
    ),
  );
  const pendingTxsFromStore = useStore((store) =>
    selectPendingTransactionByWallet(
      store.transactionsPool,
      activeAddress || zeroAddress,
    ),
  );

  const allTransactions = !!activeAddress ? allTxsFromStore : [];
  const lastTransaction = allTransactions[allTransactions.length - 1];

  const [lastTransactionSuccess, setLastTransactionSuccess] = useState(false);
  const [lastTransactionError, setLastTransactionError] = useState(false);
  const [shownUserName, setShownUserName] = useState<string | undefined>(
    activeAddress,
  );
  const [shownAvatar, setShownAvatar] = useState<string | undefined>(undefined);
  const [isAvatarExists, setIsAvatarExists] = useState<boolean | undefined>(
    undefined,
  );

  useEffect(() => {
    if (activeAddress) {
      setShownUserName(activeAddress);
      // eslint-disable-next-line
      fetchEnsNameByAddress(activeAddress).then(() => {
        const addressData =
          ensData[activeAddress.toLocaleLowerCase() as Address];
        setShownUserName(addressData?.name ? addressData.name : activeAddress);
        // eslint-disable-next-line
        selectENSAvatar({
          ensData,
          fetchEnsAvatarByAddress,
          address: activeAddress,
          setAvatar: setShownAvatar,
          setIsAvatarExists,
        });
      });
    }
    // eslint-disable-next-line
  }, [ensData, activeAddress]);

  useEffect(() => {
    if (lastTransaction?.status && activeWallet && !walletConnectedTimeLock) {
      if (lastTransaction.status === TransactionStatus.Success) {
        setLastTransactionSuccess(true);
        setTimeout(() => setLastTransactionSuccess(false), 1000);
      } else if (lastTransaction.status === TransactionStatus.Reverted) {
        setLastTransactionError(true);
        setTimeout(() => setLastTransactionError(false), 1000);
      }
    }
    // eslint-disable-next-line
  }, [lastTransaction]);

  // get all pending tx's from connected wallet
  const allPendingTransactions = activeAddress ? pendingTxsFromStore : [];
  // filtered pending tx's, if now > tx.timestamp + 30 min, than remove tx from pending array to not show loading spinner in connect wallet button
  const filteredPendingTx = allPendingTransactions.filter(
    // eslint-disable-next-line
    (tx) => dayjs().unix() <= dayjs.unix(tx.localTimestamp).unix() + 1800,
  );

  const handleDisconnect = async () => {
    await disconnectActiveWallet();
  };

  const ensNameAbbreviated = shownUserName
    ? shownUserName.length > 11
      ? textCenterEllipsis(shownUserName, 5, 3)
      : shownUserName
    : undefined;

  const avatar = !isAvatarExists
    // eslint-disable-next-line
    ? makeBlockie(activeAddress !== "" ? activeAddress : "default")
    : shownAvatar;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex items-center">
          <div className="mr-3 flex items-center">
            <ChainIcon chainId={activeWallet?.chainId} />
            <p className="ml-1 inline-block">
              {getChainName(activeWallet?.chainId ?? mainnet.id)}
            </p>
          </div>

          <button
            type="button"
            className={cn(
              "inline-flex h-[28px] min-w-[120px] items-center justify-center bg-brand-300 px-3 text-brand-900 transition-all hover:bg-brand-600 active:bg-brand-900 active:text-brand-100 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-brand-100 sm:h-[32px] sm:min-w-[155px]",
              {
                ["bg-red-400"]: lastTransactionError,
                ["bg-green-400"]: lastTransactionSuccess,
              },
            )}
          >
            <p>
              {lastTransactionError
                ? "Error"
                : lastTransactionSuccess
                  ? "Success"
                  : ensNameAbbreviated
                    ? ensNameAbbreviated
                    : textCenterEllipsis(activeAddress, 4, 4)}
            </p>
            <div className="relative ml-2 flex h-[26px] w-[26px] items-center justify-center">
              {!!filteredPendingTx.length && (
                <div className="absolute left-[50%] top-[50%] h-[26px] w-[26px] translate-x-[-50%] translate-y-[-50%]">
                  <Spinner className="h-[26px] w-[26px]" />
                </div>
              )}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="h-[20px] w-[20px] rounded-full"
                src={avatar}
                alt=""
              />
            </div>
          </button>
        </div>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle className="mb-4 text-center">Wallet info</DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <div className="flex items-start">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="h-[120px] w-[120px]" src={avatar} alt="" />
            <div className="ml-4">
              <Link
                inNewWindow
                className="mainText break-all text-lg font-bold transition-all hover:opacity-70"
                href={getScanLink({
                  chainId: activeWallet?.chainId,
                  address: activeAddress || zeroAddress,
                })}
              >
                {shownUserName}
              </Link>
            </div>
          </div>
          <div className="mt-3 flex w-full justify-end">
            <DialogClose
              className="mainText transition-all hover:opacity-65"
              type="button"
              onClick={handleDisconnect}
            >
              Disconnect
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
