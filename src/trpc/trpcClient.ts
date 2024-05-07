// only for use inside zustand

"use client";

import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { SuperJSON } from "superjson";

import { type AppRouter } from "@/server/api/root";
import { getBaseUrl } from "@/trpc/getBaseUrl";

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: getBaseUrl() + "/api/trpc",
      headers: () => {
        const headers = new Headers();
        headers.set("x-trpc-source", "nextjs-react");
        return headers;
      },
      transformer: SuperJSON,
    }),
  ],
});
