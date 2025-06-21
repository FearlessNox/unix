import { supabase } from '../lib/supabase.js';

export async function insertComment({ content, user_id, tweet_id }) {
  return await supabase
    .from('comments')
    .insert([{ content, user_id, tweet_id }])
    .select();
}

export async function getCommentsByTweet(tweet_id) {
  return await supabase
    .from('comments')
    .select('*, users(id, name, nickname)')
    .eq('tweet_id', tweet_id)
    .order('created_at', { ascending: true });
} 