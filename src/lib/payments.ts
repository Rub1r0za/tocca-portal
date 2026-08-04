/**
 * Reglas de dinero compartidas entre servidor y cliente.
 * Sin dependencias del SDK de Stripe, para que se pueda importar desde
 * componentes cliente sin arrastrar el SDK al bundle del navegador.
 */

/**
 * Cargo de servicio por pagar con tarjeta, sobre el monto abonado.
 * Ponlo en 0 para absorber la comisión de Stripe en el precio del viaje.
 * Fijado en 3% para no pasar el tope de Visa. Sigue sin ser válido sobre
 * débito y requiere registro ante las redes — ver docs/stripe.md.
 */
export const CARD_FEE_PCT = 0.03

export const cardFee = (amount: number) => Math.round(amount * CARD_FEE_PCT * 100) / 100

/** Centavos, que es como Stripe recibe los montos. */
export const toCents = (amount: number) => Math.round(amount * 100)
