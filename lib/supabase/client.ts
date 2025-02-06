import { createBrowserClient } from '@supabase/ssr';
import { Admin } from './types';

export const createClient = () => {
  return createBrowserClient<Admin>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};
