import { createClient } from '@supabase/supabase-js';

// Log para depuração. Isto nos dirá se as variáveis estão sendo carregadas.
console.log('DEBUG: Carregando cliente Supabase...');
console.log('DEBUG: SUPABASE_URL:', process.env.SUPABASE_URL ? 'Encontrada' : 'NÃO ENCONTRADA');
console.log('DEBUG: SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Encontrada' : 'NÃO ENCONTRADA');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('ERRO: Variáveis de ambiente do Supabase não encontradas!');
  console.error('SUPABASE_URL:', supabaseUrl);
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '***' : 'NÃO DEFINIDA');
}

export const supabase = createClient(supabaseUrl, supabaseKey); 