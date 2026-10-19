import { createClient } from '@supabase/supabase-js'

export const SUPABASE_URL = 'https://dfulcphjvynhtzaobaqx.supabase.co'
export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_yG_xSZqdv1pn8dVb0-hhsA_-83hPWEt'

// Ignora explicitamente valores legados do projeto antigo/pausado
const envUrl = import.meta.env.VITE_SUPABASE_URL
const envKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

const url = envUrl && !envUrl.includes('oklrrxpnayftfrlvbntd') ? envUrl : SUPABASE_URL
const key = envKey && !envKey.includes('T8tcDgrZ58vaaxhysQ2PPg_H6mGksJe') ? envKey : SUPABASE_PUBLISHABLE_KEY

export const supabase = createClient(url, key, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
})
