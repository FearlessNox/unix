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

export async function findUserByNicknameOrEmail({ nickname, email }: { nickname: string; email: string }) {
  return await supabase
    .from('users')
    .select('nickname, email')
    .or(`nickname.eq.${nickname},email.eq.${email}`)
    .maybeSingle();
}

export async function findUserByEmail(email: string) {
  return await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();
} 