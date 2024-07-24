import { identicon } from "@dicebear/collection";
import { createAvatar } from "@dicebear/core";
import { type NextRequest, NextResponse } from "next/server";

import { env } from "@/env";

export const GET = async (
  req: NextRequest,
  { params }: { params: { seed: string } },
) => {
  if (req.nextUrl.searchParams.get("key") !== env.ICON_GENERATOR_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { seed } = params;

  const avatar = createAvatar(identicon, {
    seed,
    size: 200,
    scale: 60,
    rowColor: ["1D1D1B"],
    backgroundColor: ["FCF9F5"],
  });

  const imageBuffer = await avatar.png().toArrayBuffer();

  return new NextResponse(imageBuffer, {
    headers: {
      "Content-Type": "image/png",
    },
  });
};
