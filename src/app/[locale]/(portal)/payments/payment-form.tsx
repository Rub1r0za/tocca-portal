'use client'

import { useActionState } from 'react'
import { useTranslations } from 'next-intl'
import { Check, Loader2, CreditCard } from 'lucide-react'
import { submitPayment } from './actions'

const inputClass =
  'w-full rounded-xl border border-input bg-panel-2 px-4 py-3 text-sm text-foreground placeholder:text-mist/60 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30'
const labelClass = 'mb-2 block text-xs tracking-widest text-mist uppercase'

export function PaymentForm({ locale }: { locale: string }) {
  const t = useTranslations('payments')
  const bound = submitPayment.bind(null, locale)
  const [state, action, pending] = useActionState(bound, null)

  if (state?.ok) {
    return (
      <div className="rounded-2xl border border-azure/30 bg-azure/10 px-5 py-6 text-center">
        <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-full bg-azure/20">
          <Check className="size-5 text-azure" aria-hidden />
        </div>
        <p className="text-lg text-foreground" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
          {t('sentTitle')}
        </p>
        <p className="mt-1 text-sm text-mist">{t('sentBody')}</p>
      </div>
    )
  }

  return (
    <form action={action} className="space-y-5">
      <div>
        <label htmlFor="pay-amount" className={labelClass}>{t('amount')} (USD) *</label>
        <input id="pay-amount" name="amount" type="number" min="1" step="0.01" required placeholder="500.00" className={inputClass} />
      </div>

      <div>
        <label htmlFor="pay-method" className={labelClass}>{t('method')} *</label>
        <select id="pay-method" name="method" required defaultValue="zelle" className={inputClass}>
          <option value="zelle">Zelle</option>
          <option value="transfer">{t('transfer')}</option>
        </select>
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-mist/80">
          <CreditCard className="size-3.5" aria-hidden />
          {t('stripeSoon')}
        </p>
      </div>

      <div>
        <label htmlFor="pay-reference" className={labelClass}>{t('reference')}</label>
        <input id="pay-reference" name="reference" type="text" placeholder={t('referencePlaceholder')} className={inputClass} />
      </div>

      <div>
        <label htmlFor="pay-receipt" className={labelClass}>{t('receipt')}</label>
        <input
          id="pay-receipt"
          name="receipt"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,application/pdf"
          className="block w-full text-sm text-mist file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-gold/15 file:px-4 file:py-2.5 file:text-sm file:font-medium file:text-gold hover:file:bg-gold/25"
        />
        <p className="mt-1.5 text-xs text-mist/80">{t('receiptHint')}</p>
      </div>

      <div>
        <label htmlFor="pay-notes" className={labelClass}>{t('notes')}</label>
        <textarea id="pay-notes" name="notes" rows={2} className={`${inputClass} resize-none`} />
      </div>

      {state?.error && (
        <p className="text-xs text-destructive">
          {state.error === 'receipt_size' ? t('errorReceiptSize') : t('errorGeneric')}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold px-4 py-3.5 text-sm font-medium tracking-wide text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
      >
        {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
        {pending ? t('submitting') : t('submit')}
      </button>
    </form>
  )
}
