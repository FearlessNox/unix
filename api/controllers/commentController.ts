import { insertComment, getCommentsByTweet } from '../models/commentModel.js';

export async function createCommentController(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }
  const { content, user_id, tweet_id } = req.body;
  if (!content || !user_id || !tweet_id) {
    return res.status(400).json({ error: 'Dados incompletos' });
  }
  const { data, error } = await insertComment({ content, user_id, tweet_id });
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  return res.status(201).json({ comment: data[0] });
}

export async function getCommentsController(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }
  const tweet_id = req.query.tweet_id;
  if (!tweet_id) {
    return res.status(400).json({ error: 'tweet_id é obrigatório' });
  }
  const { data, error } = await getCommentsByTweet(tweet_id);
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  return res.status(200).json({ comments: data });
} 