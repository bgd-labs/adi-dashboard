"use client";
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

type Props = {
  failedAdapters: RouterOutput["envelopes"]["getBridgingState"]["failedAdapters"];
};

export const RetryButtons = ({ failedAdapters }: Props) => {
  return (
    <Box type="danger">
      <div className="flex flex-wrap items-center justify-start gap-4 px-4 py-2 py-6 sm:px-6">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              type="danger"
              onClick={() => console.log("Retry Failed Adapters")}
            >
              Retry Failed Adapters
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="mb-6">Failed Adapters</DialogTitle>
              {failedAdapters?.map((adapter) => (
                <Checkbox key={adapter.address}>
                  {adapter.chainId} - {adapter.address}
                </Checkbox>
              ))}
              <Button type="primary">Retry adapters</Button>
            </DialogHeader>
          </DialogContent>
        </Dialog>
        <Button type="danger" onClick={() => console.log("Retry Envelope")}>
          Retry Envelope
        </Button>
      </div>
    </Box>
  );
};
