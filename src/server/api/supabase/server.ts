import { createClient } from "@supabase/supabase-js";
import { env } from "@/env";
import { type Database } from "../database.types";


export const supabaseAdmin = createClient<Database>(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_KEY,
);
