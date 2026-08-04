-- ════════════════════════════════════════════════════════════════
-- 0005 — Pagos con tarjeta (Stripe Checkout)
--   1. payments: referencias de Stripe + cargo de servicio cobrado aparte
--   2. índice único sobre stripe_session_id → idempotencia del webhook
-- ════════════════════════════════════════════════════════════════

alter table payments add column if not exists stripe_session_id        text;
alter table payments add column if not exists stripe_payment_intent_id text;

-- Cargo de servicio cobrado al cliente por usar tarjeta. NO cuenta contra el
-- total del viaje: `amount` sigue siendo lo que se abona a la reserva.
alter table payments add column if not exists fee_amount numeric(10,2) not null default 0;

-- Stripe reintenta los webhooks (hasta 3 días). Sin esto, un reintento crearía
-- un pago duplicado; con el índice el insert falla con 23505 y lo ignoramos.
create unique index if not exists payments_stripe_session_key
  on payments (stripe_session_id)
  where stripe_session_id is not null;
