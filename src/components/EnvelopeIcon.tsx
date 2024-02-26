import { cn } from "@/utils/cn";
import { createAvatar } from "@dicebear/core";
import { identicon } from "@dicebear/collection";

type Props = {
  seed: string;
  isBig?: boolean;
};

export const EnvelopeIcon = ({ seed, isBig = false }: Props) => {
  const avatar = createAvatar(identicon, {
    seed,
    size: isBig ? 90 : 30,
    scale: 80,
    rowColor: ["1D1D1B"],
  }).toDataUriSync();

  return (
    <div className="inline-block relative translate-y-0.5 -translate-x-0.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={avatar}
        alt={`Avatar for ${seed}`}
        className={cn("absolute top-1 -left-1 opacity-10", {
          ["h-8 w-8"]: !isBig,
          ["h-14 w-14"]: isBig,
        })}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={avatar}
        alt={`Avatar for ${seed}`}
        className={cn({
          ["h-8 w-8"]: !isBig,
          ["h-14 w-14"]: isBig,
        })}
      />
    </div>
  );
};
