import { insertLike, deleteLike } from '../models/likeModel.js';

export async function likeTweetController(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }
  const { user_id, tweet_id } = req.body;
  if (!user_id || !tweet_id) {
    return res.status(400).json({ error: 'Dados incompletos' });
  }
  const { data, error } = await insertLike({ user_id, tweet_id });
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  return res.status(201).json({ like: data[0] });
}

export async function unlikeTweetController(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Método não permitido' });
  }
  const { user_id, tweet_id } = req.body;
  if (!user_id || !tweet_id) {
    return res.status(400).json({ error: 'Dados incompletos' });
  }
  const { error } = await deleteLike({ user_id, tweet_id });
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  return res.status(200).json({ message: 'Like removido com sucesso' });
} 