# Pagos con tarjeta (Stripe)

Cuenta: **Tocca Amalfi Coast** (`acct_1Sk5Qz…`), país **US**, moneda `usd`.
Ya está activada (`charges_enabled` + `payouts_enabled`). Los payouts están en
**manual**: la plata se queda en el balance de Stripe hasta que la retiren.

## Cómo funciona

1. El cliente pone un monto en `/[locale]/payments` y le da a "Pagar con tarjeta".
2. `startCardPayment` crea una **Checkout Session** y lo redirige a Stripe.
   Los datos de tarjeta nunca tocan este servidor.
3. Stripe cobra y llama a `POST /api/stripe/webhook`.
4. El webhook verifica la firma e inserta el pago con `status: 'approved'` —
   sin comprobante ni revisión manual, a diferencia de Zelle/transferencia.

El pago se registra **solo desde el webhook**, nunca desde el `success_url`: el
cliente puede cerrar el navegador antes de volver, y la URL de retorno se puede
falsificar a mano.

## Variables de entorno

| Variable | Dónde sale |
|---|---|
| `STRIPE_SECRET_KEY` | Dashboard → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | lo da `stripe listen` (dev) o el dashboard (prod) |
| `NEXT_PUBLIC_SITE_URL` | URL base para los links de retorno |

## Probar en local

```bash
npm run dev
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

`stripe listen` imprime un `whsec_…` → ponlo en `STRIPE_WEBHOOK_SECRET` y
reinicia el dev server. Tarjeta de prueba: `4242 4242 4242 4242`, cualquier
fecha futura y cualquier CVC.

## Pasar a producción

1. Correr la migración `0005_stripe_payments.sql` en Supabase.
2. Crear el endpoint en Dashboard → Developers → Webhooks apuntando a
   `https://<dominio>/api/stripe/webhook`, evento `checkout.session.completed`.
3. Copiar el `whsec_…` de producción a las env vars de Vercel, junto con la
   `sk_live_…` (mejor una **restricted key**: escritura en Checkout Sessions,
   lectura en PaymentIntents) y `NEXT_PUBLIC_SITE_URL`.

## El cargo por tarjeta — fijado en 3%

Está en `src/lib/payments.ts` como `CARD_FEE_PCT`. Se cobra como línea aparte en
Checkout y se guarda en `payments.fee_amount`; **no** cuenta contra el total del
viaje, así que el saldo del cliente sigue cuadrando. El desglose que ve el
cliente sale del mismo constante, no hay porcentajes escritos a mano en el copy.

Se bajó de 5,5% a **3%** para no pasar el tope de Visa. Queda pendiente esto,
que no se resuelve con código — como el cargo aplica solo al pagar con tarjeta
(Zelle y transferencia no lo llevan), legalmente es un *surcharge*, no un
"service fee", y en EE.UU. las redes lo regulan:

- **Prohibido sobre débito**, aunque el cliente la pase como crédito. Stripe no
  distingue débito de crédito en Checkout, así que hoy se le cobra a ambos.
- Hay que **registrarlo ante Visa/Mastercard** con antelación (~30 días) y
  declararlo visiblemente al cobrar.
- Varios estados lo prohíben o lo limitan por debajo del 3%.

Conviene confirmarlo con un contador o abogado en EE.UU. Si sale que no se
puede, **poner `CARD_FEE_PCT = 0`** y subir el precio del viaje para absorber la
comisión de Stripe (~2,9% + $0,30, más en tarjetas internacionales) es un
cambio de una línea.
