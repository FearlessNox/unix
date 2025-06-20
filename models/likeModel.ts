import { supabase } from '../lib/supabase.js';

export async function insertLike({ user_id, tweet_id }) {
  return await supabase
    .from('likes')
    .insert([{ user_id, tweet_id }])
    .select();
}

export async function deleteLike({ user_id, tweet_id }) {
  return await supabase
    .from('likes')
    .delete()
    .eq('user_id', user_id)
    .eq('tweet_id', tweet_id);
} 