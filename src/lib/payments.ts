/**
 * Reglas de dinero compartidas entre servidor y cliente.
 * Sin dependencias del SDK de Stripe, para que se pueda importar desde
 * componentes cliente sin arrastrar el SDK al bundle del navegador.
 */

/**
 * Cargo de servicio por pagar con tarjeta, sobre el monto abonado.
 * Ponlo en 0 para absorber la comisión de Stripe en el precio del viaje.
 * OJO: la cuenta es de EE.UU. y recargar por pagar con tarjeta está regulado
 * por las redes (tope del 3% en Visa, prohibido sobre débito).
 */
export const CARD_FEE_PCT = 0.055

export const cardFee = (amount: number) => Math.round(amount * CARD_FEE_PCT * 100) / 100

/** Centavos, que es como Stripe recibe los montos. */
export const toCents = (amount: number) => Math.round(amount * 100)
