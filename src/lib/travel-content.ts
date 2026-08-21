import type { Localized } from './types'

/**
 * Contenido editorial de Tocca que no vive en la base de datos: es el mismo
 * para todos los viajeros y lo escribe Jess, no el panel. Está aquí en vez de
 * en messages/*.json porque son textos largos que van emparejados es/en y se
 * revisan juntos.
 */

export type TipIcon =
  | 'shoes' | 'clothes' | 'water-shoes' | 'suitcase' | 'plug' | 'phone' | 'bottle' | 'sun' | 'lemon'

export type TravelTip = {
  icon: TipIcon
  title: Localized
  body: Localized
}

/** "Algunas cosas importantes a tener en cuenta antes de tu viaje". */
export const BEFORE_YOU_GO: TravelTip[] = [
  {
    icon: 'shoes',
    title: {
      es: "El calzado cómodo es esencial",
      en: "Comfortable shoes are essential",
    },
    body: {
      es: "La Costa Amalfitana es absolutamente hermosa, pero también muy vertical. Prepárate para escaleras, callejuelas con encanto y bastante caminata durante el viaje.",
      en: "The Amalfi Coast is absolutely beautiful — and also very vertical. Expect stairs, charming alleyways, and plenty of walking throughout the journey.",
    },
  },
  {
    icon: 'clothes',
    title: {
      es: "Piensa en un estilo mediterráneo sin esfuerzo",
      en: "Think effortless Mediterranean chic",
    },
    body: {
      es: "Lleva lino, tejidos ligeros, elegancia relajada, sandalias cómodas, traje de baño, gafas de sol y una capa ligera para las noches más frescas junto al mar.",
      en: "Pack linen, light fabrics, relaxed elegance, comfortable sandals, swimwear, sunglasses, and a light layer for cooler evenings by the sea.",
    },
  },
  {
    icon: 'water-shoes',
    title: {
      es: "Los zapatos de agua son una gran idea",
      en: "Water shoes are a great idea",
    },
    body: {
      es: "Muchas playas de la Costa Amalfitana son de piedras o rocosas más que de arena, por lo que recomendamos mucho llevar zapatos de agua o sandalias de playa cómodas.",
      en: "Many beaches along the Amalfi Coast are pebbled or rocky rather than sandy, so water shoes or easy beach sandals are highly recommended.",
    },
  },
  {
    icon: 'suitcase',
    title: {
      es: "Deja espacio en tu maleta",
      en: "Leave room in your suitcase",
    },
    body: {
      es: "No lleves demasiado. Seguramente querrás dejar espacio para cerámicas, piezas de lino, limoncello, sandalias de cuero hechas a mano y otros tesoros que descubras en el camino.",
      en: "Don’t overpack. You’ll likely want extra space for ceramics, linen pieces, limoncello, handmade leather sandals, and other treasures you discover along the way.",
    },
  },
  {
    icon: 'plug',
    title: {
      es: "Lleva un adaptador europeo",
      en: "Bring a European travel adapter",
    },
    body: {
      es: "Recuerda traer un adaptador europeo para poder cargar tus dispositivos fácilmente durante el viaje.",
      en: "Please remember to bring a European travel adapter so you can easily charge your devices throughout the journey.",
    },
  },
  {
    icon: 'phone',
    title: {
      es: "Revisa tu itinerario cada día",
      en: "Check your journey daily",
    },
    body: {
      es: "Antes de salir cada día, revisa el itinerario del día en la app. Encontrarás punto de encuentro, recomendaciones, tips diarios e información útil para que aproveches al máximo cada experiencia.",
      en: "Before heading out each day, review that day’s journey in the app. You’ll find meeting details, recommendations, daily tips, and helpful “good to know” information designed to help you make the most of every experience.",
    },
  },
  {
    icon: 'bottle',
    title: {
      es: "Mantente hidratado",
      en: "Stay hydrated",
    },
    body: {
      es: "Lleva siempre una botella de agua contigo. La hidratación es especialmente importante durante los meses más cálidos.",
      en: "Always keep a bottle of water with you. Hydration is especially important in the warmer months.",
    },
  },
  {
    icon: 'sun',
    title: {
      es: "No olvides la protección solar",
      en: "Don’t forget sun protection",
    },
    body: {
      es: "Trae protector solar, gafas de sol y un sombrero. El sol en la costa puede ser fuerte, especialmente en los días de barco y durante las largas tardes al aire libre.",
      en: "Bring sunscreen, sunglasses, and a hat. The coastal sun can be strong, especially on boat days and during long afternoons outdoors.",
    },
  },
  {
    icon: 'lemon',
    title: {
      es: "Relájate y disfruta",
      en: "Relax & enjoy",
    },
    body: {
      es: "Hemos cuidado cada detalle para ti. Estamos felices de compartir contigo esta hermosa aventura por la Costa Amalfitana.",
      en: "Everything has been carefully curated for you. We can’t wait to share this beautiful Amalfi Coast adventure with you.",
    },
  },
]

export type Phrase = {
  /** Lo que se dice en voz alta. */
  it: string
  es: string
  en: string
}

/** Las frases que de verdad se usan en la mesa y por la calle. */
export const PHRASES: Phrase[] = [
  { it: "Ciao!", es: "¡Hola!", en: "Hello!" },
  { it: "Buongiorno!", es: "¡Buenos días!", en: "Good morning!" },
  { it: "Buonasera!", es: "¡Buenas tardes / noches!", en: "Good evening!" },
  { it: "Per favore", es: "Por favor", en: "Please" },
  { it: "Grazie mille!", es: "¡Muchas gracias!", en: "Thank you so much!" },
  { it: "Dov’è il bagno?", es: "¿Dónde está el baño?", en: "Where is the bathroom?" },
  { it: "Il conto, per favore.", es: "La cuenta, por favor.", en: "The bill, please." },
  { it: "È buonissimo!", es: "¡Está delicioso!", en: "It’s delicious!" },
  { it: "Ancora vino, per favore! 🍷", es: "Más vino, por favor.", en: "More wine, please!" },
  { it: "Un altro limoncello, per favore! 🍋", es: "Otro limoncello, por favor.", en: "Another limoncello, please!" },
  { it: "Che meraviglia!", es: "¡Qué maravilla!", en: "How wonderful!" },
  { it: "Basta pasta… almeno per oggi! 😂", es: "Suficiente pasta… al menos por hoy.", en: "Enough pasta… at least for today!" },
  { it: "Non voglio tornare a casa!", es: "¡No quiero volver a casa!", en: "I don’t want to go home!" },
]
