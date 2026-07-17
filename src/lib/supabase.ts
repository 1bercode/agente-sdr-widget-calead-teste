import { createClient } from "@supabase/supabase-js";

// Cliente para uso no browser (widget). Usa a chave anônima — segura para
// expor no client, protegida por Row Level Security no Supabase.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabaseBrowser = () => createClient(supabaseUrl, supabaseAnonKey);

// Cliente para uso em rotas de servidor (API routes), com a service role key.
// NUNCA importar este arquivo em código que roda no browser.
export const supabaseServer = () => {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });
};
