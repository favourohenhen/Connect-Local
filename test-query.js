import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('workers').select('id, service_category, location_area, street, status, trust_score, is_available, created_at, bio, profile_image_url, cover_image, recommended_by, contact_phone, specialties, profiles(full_name)');
  console.log('Error:', error);
  console.log('Data:', data?.length);
}

test();
