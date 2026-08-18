import { createClient } from './supabase/server'

/**
 * ¿Quien llama es admin? Las Server Actions son endpoints HTTP públicos: sin
 * esta comprobación cualquiera podría invocarlas desde fuera del panel.
 */
export async function isAdmin(): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  return data?.role === 'admin'
}
