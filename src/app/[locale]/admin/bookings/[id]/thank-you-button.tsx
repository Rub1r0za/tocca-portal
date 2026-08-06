'use client'

import { useActionState } from 'react'
import { Loader2, Heart } from 'lucide-react'
import { sendTripThankYou } from '../../actions'

export function ThankYouButton({
  bookingId,
  locale,
}: {
  bookingId: string
  locale: string
}) {
  const bound = sendTripThankYou.bind(null, bookingId, locale)
  const [state, action, pending] = useActionState(bound, null)

  return (
    <form action={action}>
      {state?.error && <p className="mb-3 text-xs text-red-600">{state.error}</p>}
      {state?.ok && <p className="mb-3 text-xs text-[#4A9A92]">Correo de agradecimiento enviado ✓</p>}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-xl border border-[#4A9A92]/40 bg-white px-4 py-2.5 text-sm font-medium text-[#4A9A92] transition-colors hover:bg-[#4A9A92]/10 disabled:opacity-60"
        onClick={(e) => {
          if (!confirm('¿Enviar al viajero el correo de gracias con la invitación a dejar reseña?')) e.preventDefault()
        }}
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Heart className="size-4" />}
        Enviar agradecimiento + reseñas
      </button>
    </form>
  )
}
