'use client'

import { useActionState } from 'react'
import { Loader2, Send } from 'lucide-react'
import { sendTestEmail } from './actions'

export function TestEmailForm({ defaultTo }: { defaultTo: string }) {
  const [state, action, pending] = useActionState(sendTestEmail, null)

  return (
    <form action={action} className="space-y-3">
      <div>
        <label
          htmlFor="to"
          className="mb-1.5 block text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[#7A7168]"
        >
          Enviar a
        </label>
        <input
          id="to"
          name="to"
          type="email"
          defaultValue={defaultTo}
          placeholder="tu@correo.com"
          className="w-full rounded-xl border border-[rgba(62,45,35,0.18)] bg-[#FAFAF8] px-4 py-2.5 text-sm text-[#3E2D23] placeholder:text-[#7A7168]/60 focus:border-[#4A9A92] focus:outline-none focus:ring-2 focus:ring-[#4A9A92]/20"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="flex items-center gap-1.5 rounded-xl bg-[#4A9A92] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
        Enviar prueba
      </button>

      {state?.ok && (
        <p className="text-xs text-[#4A9A92]">
          Salió sin errores hacia {state.to}. Si no aparece en unos minutos, mira la carpeta de spam
          y el registro de Resend.
        </p>
      )}
      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
    </form>
  )
}
