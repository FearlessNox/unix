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

export async function getLikesByTweet(tweet_id) {
  return await supabase
    .from('likes')
    .select('*, users(id, name, nickname)')
    .eq('tweet_id', tweet_id);
}

export async function checkUserLiked({ user_id, tweet_id }) {
  const { data, error } = await supabase
    .from('likes')
    .select('id')
    .eq('user_id', user_id)
    .eq('tweet_id', tweet_id)
    .single();
  
  return { liked: !!data, error };
}

export async function getLikeCountByTweet(tweet_id) {
  const { count, error } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('tweet_id', tweet_id);
  
  return { count: count || 0, error };
} 