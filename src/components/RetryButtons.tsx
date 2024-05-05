"use client";
import { useState } from "react";
import { Button } from "@/components/Button";
import { type RouterOutput } from "@/server/api/types";
import { Box } from "@/components/Box";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/Modal";
import { Checkbox } from "@/components/Checkbox";
import { ChainIcon } from "./ChainIcon";

type Props = {
  failedAdapters: RouterOutput["envelopes"]["getBridgingState"]["failedAdapters"];
};

export const RetryButtons = ({ failedAdapters }: Props) => {
  const [adapters, setAdapters] = useState<string[]>([]);

  const handleCheckedChange = (address: string, checked: boolean) => {
    if (checked) {
      setAdapters((prevAdapters) => [...prevAdapters, address]);
    } else {
      setAdapters((prevAdapters) => prevAdapters.filter((a) => a !== address));
    }
  };

  const handleSubmit = () => {
    console.log("Retry Adapters", adapters);
  };

  return (
    <Box type="danger">
      <div className="flex flex-wrap items-center justify-start gap-4 px-4 py-2 py-6 sm:px-6">
        {failedAdapters?.length !== 0 && (
          <Dialog>
            <DialogTrigger asChild>
              <Button type="danger">Retry Failed Adapters</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="mb-6">Failed Adapters</DialogTitle>
              </DialogHeader>
              <div className="grid gap-3 pb-4">
                {failedAdapters?.map((adapter) => (
                  <Checkbox
                    key={adapter.address}
                    id={adapter.address!}
                    onCheckedChange={(value) =>
                      handleCheckedChange(adapter.address!, value)
                    }
                  >
                    <div className="flex items-center gap-2 text-sm">
                      <ChainIcon chainId={adapter.chainId} />
                      <div className="font-semibold">{adapter.name}</div>
                      <div className="truncate font-mono text-brand-500">
                        {adapter.address}
                      </div>
                    </div>
                  </Checkbox>
                ))}
              </div>
              <Button type="primary" fullWidth onClick={handleSubmit}>
                Retry adapters
              </Button>
            </DialogContent>
          </Dialog>
        )}
        <Button type="danger" onClick={() => console.log("Retry Envelope")}>
          Retry Envelope
        </Button>
      </div>
    </Box>
  );
};
