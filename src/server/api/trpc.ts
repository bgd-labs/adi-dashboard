import { initTRPC } from "@trpc/server";
// eslint-disable-next-line import/default
import superjson from "superjson";
import { ZodError } from "zod";

import { supabase, supabaseAdmin } from "./supabase";

export const createTRPCContext = async (opts: { headers?: Headers }) => {
  return {
    supabase,
    supabaseAdmin,
    ...opts,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createCallerFactory = t.createCallerFactory;

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
