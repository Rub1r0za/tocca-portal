'use client'

import { useActionState, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Check, Loader2, CreditCard } from 'lucide-react'
import { submitPayment, startCardPayment } from './actions'
import { CARD_FEE_PCT, cardFee } from '@/lib/payments'

const inputClass =
  'w-full rounded-xl border border-input bg-panel-2 px-4 py-3 text-sm text-foreground placeholder:text-mist/60 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30'
const labelClass = 'mb-2 block text-xs tracking-widest text-mist uppercase'

const fmtMoney = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2 })}`

/** Pago con tarjeta: manda a Stripe Checkout, sin comprobante ni revisión. */
export function CardPaymentForm({ locale }: { locale: string }) {
  const t = useTranslations('payments')
  const bound = startCardPayment.bind(null, locale)
  const [state, action, pending] = useActionState(bound, null)
  const [amount, setAmount] = useState('')

  const parsed = Number(amount)
  const valid = Number.isFinite(parsed) && parsed > 0
  const fee = valid ? cardFee(parsed) : 0

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="card-amount" className={labelClass}>{t('amount')} (USD) *</label>
        <input
          id="card-amount"
          name="amount"
          type="number"
          min="1"
          step="0.01"
          required
          placeholder="500.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className={inputClass}
        />
      </div>

      {fee > 0 && (
        <dl className="space-y-1 rounded-xl bg-panel-2/60 px-4 py-3 text-xs text-mist">
          <div className="flex justify-between">
            <dt>{t('cardBreakdownTrip')}</dt>
            <dd className="tabular-nums">{fmtMoney(parsed)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>{t('cardBreakdownFee', { pct: (CARD_FEE_PCT * 100).toLocaleString(locale) })}</dt>
            <dd className="tabular-nums">{fmtMoney(fee)}</dd>
          </div>
          <div className="flex justify-between border-t border-hairline pt-1 font-medium text-foreground">
            <dt>{t('cardBreakdownTotal')}</dt>
            <dd className="tabular-nums">{fmtMoney(parsed + fee)}</dd>
          </div>
        </dl>
      )}

      {state?.error && <p className="text-xs text-destructive">{t('errorCard')}</p>}

      <button
        type="submit"
        disabled={pending || !valid}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold px-4 py-3.5 text-sm font-medium tracking-wide text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
      >
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <CreditCard className="size-4" aria-hidden />}
        {pending ? t('cardRedirecting') : t('cardSubmit')}
      </button>

      <p className="text-center text-[0.7rem] text-mist/80">{t('cardSecure')}</p>
    </form>
  )
}

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
