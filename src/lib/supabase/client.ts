import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Country } from "@/lib/countries";

let client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  if (!client) {
    client = createClient(url, key);
  }
  return client;
}

export async function fetchCountriesFromSupabase(): Promise<Country[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("countries")
    .select("id, name_de, capital_de, iso_code, region")
    .order("name_de");

  if (error || !data?.length) return null;
  return data as Country[];
}
