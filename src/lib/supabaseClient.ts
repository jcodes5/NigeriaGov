
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase'; // We will create this type file later

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_URL. Please ensure it is set in your .env file.");
}
if (!supabaseAnonKey) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY. Please ensure it is set in your .env file.");
}

// Add a check for URL validity
try {
  new URL(supabaseUrl); // This will throw if the URL is invalid
} catch (e) {
  throw new Error(`Invalid NEXT_PUBLIC_SUPABASE_URL: "${supabaseUrl}". Please ensure it is a valid URL (e.g., https://<project-ref>.supabase.co).`);
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
