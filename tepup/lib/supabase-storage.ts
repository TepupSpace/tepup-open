import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const IMAGES_BUCKET = 'course_images';

let _client: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!_client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars must be set');
    }
    _client = createClient(url, key);
  }
  return _client;
}
