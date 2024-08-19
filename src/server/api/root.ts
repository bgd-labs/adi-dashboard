import { envelopesRouter } from "@/server/api/routers/envelopes";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

import { addressRouter } from "./routers/addresses";
import { controllersRouter } from "./routers/controllers";
import { eventsRouter } from "./routers/events";
import { transactionsRouter } from "./routers/transactions";

export const appRouter = createTRPCRouter({
  envelopes: envelopesRouter,
  events: eventsRouter,
  address: addressRouter,
  transactions: transactionsRouter,
  controllers: controllersRouter,
});

export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);
