import { supabase } from '../lib/supabase.js';

export async function insertTweet({ content, user_id }) {
  return await supabase
    .from('tweets')
    .insert([{ content, user_id }])
    .select();
}

export async function getAllTweets() {
  return await supabase
    .from('tweets')
    .select('*, users(id, name, nickname)')
    .order('created_at', { ascending: false });
} 