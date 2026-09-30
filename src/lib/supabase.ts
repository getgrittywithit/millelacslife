import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database
export interface Business {
  id: string;
  slug: string;
  name: string;
  category: 'resort' | 'restaurant' | 'guide' | 'boat-rental' | 'bait-shop' | 'marina' | 'real-estate' | 'service';
  featured: boolean;
  status: 'draft' | 'published' | 'archived';
  address: string | null;
  city: string | null;
  phone: string | null;
  website: string | null;
  email: string | null;
  hours: string | null;
  description: string | null;
  full_description: string | null;
  amenities: string[];
  location: 'north-shore' | 'south-shore' | 'east-shore' | 'west-shore' | null;
  latitude: number | null;
  longitude: number | null;
  image_url: string | null;
  gallery: string[];
  created_at: string;
  updated_at: string;
}

export interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  interests: string[];
  status: 'active' | 'unsubscribed' | 'bounced';
  source: string;
  confirmed_at: string | null;
  unsubscribed_at: string | null;
  created_at: string;
  updated_at: string;
}

// Helper functions
export async function getBusinesses(category?: string) {
  let query = supabase
    .from('businesses')
    .select('*')
    .eq('status', 'published')
    .order('featured', { ascending: false })
    .order('name');

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching businesses:', error);
    return [];
  }

  return data as Business[];
}

export async function getBusinessBySlug(slug: string) {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error) {
    console.error('Error fetching business:', error);
    return null;
  }

  return data as Business;
}

export async function getFeaturedBusinesses() {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('status', 'published')
    .eq('featured', true)
    .order('name');

  if (error) {
    console.error('Error fetching featured businesses:', error);
    return [];
  }

  return data as Business[];
}
