import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltan las variables de entorno de Supabase. Verifica tu archivo .env')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Espera una consulta de supabase-js y devuelve solo `data`, lanzando si hay
// error. Evita repetir `const { data, error } = ...; if (error) throw error`
// en cada función de src/datos/.
export async function unwrap(consulta) {
  const { data, error } = await consulta
  if (error) throw error
  return data
}