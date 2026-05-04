import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://rgybqqzxdlfmlljvettg.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJneWJxcXp4ZGxmbWxsanZldHRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2ODEzNjQsImV4cCI6MjA5MDI1NzM2NH0.Lah_NAcRgvamav5GxMO-erj5YTWhNJl01EklwC8wrUE",
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
