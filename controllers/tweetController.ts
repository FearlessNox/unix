import { insertTweet, getAllTweets } from '../models/tweetModel.js';

export async function createTweetController(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }
  const { content, user_id } = req.body;
  if (!content || !user_id) {
    return res.status(400).json({ error: 'Dados incompletos' });
  }
  const { data, error } = await insertTweet({ content, user_id });
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  return res.status(201).json({ tweet: data[0] });
}

export async function getTweetsController(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }
  const { data, error } = await getAllTweets();
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  return res.status(200).json({ tweets: data });
} 