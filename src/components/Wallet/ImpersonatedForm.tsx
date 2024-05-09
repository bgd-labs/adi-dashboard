import { WalletType } from "@bgd-labs/frontend-web3-utils";
import * as Form from "@radix-ui/react-form";
import { type FormEvent } from "react";
import { isAddress } from "viem";

import { DESIRED_CHAIN_ID, useStore } from "@/providers/ZustandStoreProvider";

export const ImpersonatedForm = () => {
  const setImpersonated = useStore((store) => store.setImpersonated);
  const connectWallet = useStore((store) => store.connectWallet);

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(e.currentTarget)) as {
      impersonatedAddress: string;
    };
    setImpersonated(formData.impersonatedAddress);
    await connectWallet(WalletType.Impersonated, DESIRED_CHAIN_ID);
  };

  return (
    <div className="flex items-center justify-center">
      <Form.Root className="w-full" onSubmit={handleFormSubmit}>
        <Form.Field name="impersonatedAddress">
          <Form.Label>Account address</Form.Label>
          <div className="relative pb-[20px]">
            <Form.Control asChild>
              <input
                className="border-brand-400 dark:border-brand-700 my-1 w-full border p-1 text-[16px] text-brand-900 dark:text-brand-100"
                type="text"
                required
              />
            </Form.Control>
            <Form.Message
              className="absolute bottom-0 left-0 w-full text-[12px] text-red-500"
              match={(value) =>
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                !isAddress(value) ?? value === "" ?? value === undefined
              }
            >
              Please enter correct account address
            </Form.Message>
          </div>
        </Form.Field>

        <div className="mt-8 flex items-center justify-center">
          <Form.Submit asChild>
            <button className="hover:bg-brand-600 bg-brand-900 px-6 py-2 text-[14px] font-bold text-brand-100 transition-all">
              Connect
            </button>
          </Form.Submit>
        </div>
      </Form.Root>
    </div>
  );
};
