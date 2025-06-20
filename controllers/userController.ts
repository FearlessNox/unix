import { insertUser, getAllUsers } from '../models/userModel.js';

export async function createUserController(req, res) {
  console.log('DEBUG: Variável SUPABASE_URL é:', process.env.SUPABASE_URL);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }
  const { name, nickname, email, password } = req.body;
  if (!name || !nickname || !email || !password) {
    return res.status(400).json({ error: 'Dados incompletos' });
  }
  const { data, error } = await insertUser({ name, nickname, email, password });
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  return res.status(201).json({ user: data[0] });
}

export async function getUsersController(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }
  const { data, error } = await getAllUsers();
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  return res.status(200).json({ users: data });
} 