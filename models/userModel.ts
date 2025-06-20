import { supabase } from '../lib/supabase.js';

export async function insertUser({ name, nickname, email, password }) {
  return await supabase
    .from('users')
    .insert([{ name, nickname, email, password }])
    .select();
}

export async function getAllUsers() {
  return await supabase
    .from('users')
    .select('*');
} 