import { type FailedBlock, type RangeStatus } from "./types";

export const prepareBlockIntervals = (
  firstBlock: number,
  lastBlock: number,
  lastScannedBlock: number,
  failedBlocks: FailedBlock[],
): RangeStatus[] => {
  const blockIntervals: RangeStatus[] = [];
  let currentBlock = firstBlock;

  failedBlocks.sort((a, b) => a.from_block - b.from_block);

  for (const failedBlock of failedBlocks) {
    if (currentBlock < failedBlock.from_block) {
      blockIntervals.push({
        range: [currentBlock, failedBlock.from_block - 1],
        status: "scanned",
      });
    }

    blockIntervals.push({
      range: [failedBlock.from_block, failedBlock.to_block],
      status: "failed",
    });

    currentBlock = failedBlock.to_block + 1;
  }

  // Add the scanned blocks between the last failed block and the lastScannedBlock
  if (currentBlock <= lastScannedBlock) {
    blockIntervals.push({
      range: [currentBlock, lastScannedBlock],
      status: "scanned",
    });
    currentBlock = lastScannedBlock + 1;
  }

  // Add the pending blocks from the lastScannedBlock to the lastBlock
  if (currentBlock <= lastBlock) {
    blockIntervals.push({
      range: [currentBlock, lastBlock],
      status: "pending",
    });
  }

  return blockIntervals;
};
