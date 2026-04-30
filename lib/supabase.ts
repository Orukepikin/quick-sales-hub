import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function missingSupabaseClient(name: string): SupabaseClient {
  return new Proxy(
    {},
    {
      get() {
        throw new Error(
          `${name} is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.`
        );
      },
    }
  ) as SupabaseClient;
}

// Client-side Supabase (for auth & realtime)
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : missingSupabaseClient("Supabase client");

// Server-side Supabase (with service role for admin operations)
export const supabaseAdmin =
  supabaseUrl && supabaseAnonKey
    ? createClient(
        supabaseUrl,
        process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      )
    : missingSupabaseClient("Supabase admin client");
