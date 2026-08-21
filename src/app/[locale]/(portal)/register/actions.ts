'use server'

import { z } from 'zod'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { notifyAdmin, emailLayout } from '@/lib/email'

const travelerSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  type: z.enum(['adult', 'child']),
})

const registrationSchema = z.object({
  full_name: z.string().min(2),
  phone: z.string().min(5),
  booking_type: z.enum(['individual', 'group']),
  companions: z.array(travelerSchema).max(30),
  accepted_terms: z.literal(true),
  notes: z.string().optional(),
})

export type RegistrationInput = z.infer<typeof registrationSchema>

export async function submitRegistration(
  locale: string,
  input: RegistrationInput,
): Promise<{ error?: string }> {
  const parsed = registrationSchema.safeParse(input)
  if (!parsed.success) return { error: 'invalid' }
  const data = parsed.data

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'auth' }

  const admin = createAdminClient()

  // Evita reservas duplicadas del mismo usuario
  const { data: existing } = await admin
    .from('bookings')
    .select('id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle()
  if (existing) return { error: 'exists' }

  await admin.from('profiles').upsert(
    { id: user.id, full_name: data.full_name },
    { onConflict: 'id' },
  )

  const { data: booking, error } = await admin
    .from('bookings')
    .insert({
      user_id: user.id,
      status: 'pending',
      type: data.booking_type,
      title: { en: 'Tocca Amalfi Coast', es: 'Tocca Amalfi Coast' },
      applicant_name: data.full_name,
      applicant_email: user.email,
      applicant_phone: data.phone,
      notes: data.notes || null,
      terms_accepted_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (error) return { error: error.message }

  // El solicitante siempre es el primer viajero
  const [first, ...rest] = data.full_name.trim().split(/\s+/)
  const travelers = [
    { booking_id: booking.id, first_name: first, last_name: rest.join(' ') || '—', type: 'adult' as const },
    // Solo menores. El formulario ya no ofrece otra cosa, pero esto es una
    // Server Action —un endpoint público— y el tipo se fija aquí.
    ...data.companions.map((c) => ({
      booking_id: booking.id,
      first_name: c.first_name,
      last_name: c.last_name,
      type: 'child' as const,
    })),
  ]
  const { error: travErr } = await admin.from('travelers').insert(travelers)
  if (travErr) return { error: travErr.message }

  await notifyAdmin(
    `Nueva reserva pendiente — ${data.full_name}`,
    emailLayout(
      'Nueva reserva por aprobar',
      `<p><strong>${data.full_name}</strong> (${user.email}, tel. ${data.phone}) completó su registro.</p>
       <p>Viajeros: ${travelers.length} (1 adulto${data.companions.length ? ` + ${data.companions.length} menor(es)` : ''}) · Términos aceptados ✓</p>
       <p><a href="https://tocca-portal.vercel.app/es/admin/bookings/${booking.id}" style="color:#4A9A92;">Revisar y aprobar en el panel →</a></p>`,
    ),
  )

  revalidatePath(`/${locale}/dashboard`)
  redirect(`/${locale}/dashboard`)
}
