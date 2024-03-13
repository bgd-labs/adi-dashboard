import { envelopesRouter } from "@/server/api/routers/envelopes";
import { eventsRouter } from "./routers/events";
import { addressRouter } from "./routers/addresses";
import { transactionsRouter } from "./routers/transactions";
import { controllersRouter } from "./routers/controllers";
import { createTRPCRouter } from "@/server/api/trpc";

export const appRouter = createTRPCRouter({
  envelopes: envelopesRouter,
  events: eventsRouter,
  address: addressRouter,
  transactions: transactionsRouter,
  controllers: controllersRouter,
});

export type AppRouter = typeof appRouter;
