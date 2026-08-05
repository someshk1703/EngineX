import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.warn('[EngineX] Supabase env vars not set — auth will not work')
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '')

export async function signInWithGoogle() {
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  })
}

export async function signInWithGitHub() {
  return supabase.auth.signInWithOAuth({
    provider: 'github',
    options: { redirectTo: window.location.origin },
  })
}

export async function signOut() {
  return supabase.auth.signOut()
}

export async function signUpWithEmail(email, password, fullName) {
  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: fullName ? { full_name: fullName } : undefined,
      emailRedirectTo: window.location.origin,
    },
  })
}

export async function signInWithEmail(email, password) {
  return supabase.auth.signInWithPassword({ email, password })
}

export async function resetPasswordForEmail(email) {
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin,
  })
}

export async function getSession() {
  const { data } = await supabase.auth.getSession()
  return data.session
}
