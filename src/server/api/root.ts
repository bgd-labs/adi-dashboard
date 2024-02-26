import { envelopesRouter } from "@/server/api/routers/envelopes";
import { eventsRouter } from "./routers/events";
import { addressRouter } from "./routers/addresses";
import { createTRPCRouter } from "@/server/api/trpc";

export const appRouter = createTRPCRouter({
  envelopes: envelopesRouter,
  events: eventsRouter,
  address: addressRouter,
});

export type AppRouter = typeof appRouter;
