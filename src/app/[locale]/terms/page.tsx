import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

type Section = { title: string; items: string[] }

const CONTENT: Record<string, { heading: string; intro: string; back: string; sections: Section[] }> = {
  en: {
    heading: 'Terms & Conditions',
    intro:
      'By making any payment toward the TOCCA Amalfi Coast experience, the client confirms that they have read, understood, and fully accepted these Terms & Conditions on behalf of themselves and all participants included in the reservation.',
    back: 'Back',
    sections: [
      {
        title: '1. Booking & Payment Terms',
        items: [
          'To secure a spot, a non-refundable and non-transferable deposit per person is required. The amount is confirmed at the time of booking.',
          'After the initial deposit, a second non-refundable and non-transferable payment of 30% of the total trip cost is required to confirm participation.',
          'The remaining 70% balance must be paid no later than forty-five (45) days prior to the official trip start date. Failure to complete payment on time may result in cancellation of the reservation without refund of amounts already paid.',
        ],
      },
      {
        title: '2. Cancellation & Refund Policy',
        items: [
          'The initial deposit and the 30% confirmation payment are strictly non-refundable and non-transferable under any circumstances.',
          'The 70% final payment is refundable only if cancellation is made at least thirty-five (35) days prior to the trip start date.',
          'Cancellations made within 35 days of the departure date are not eligible for any refund, regardless of reason.',
          'No refunds will be issued for: late arrivals or early departures; missed flights or travel disruptions; illness or medical conditions; personal decisions or changes of plans; weather conditions; government restrictions or travel bans; force majeure events or circumstances beyond the company’s control.',
        ],
      },
      {
        title: '3. Travel Insurance (Strongly Recommended)',
        items: [
          'TOCCA Amalfi Coast strongly recommends that all participants purchase comprehensive travel insurance from a third-party provider to protect their investment.',
          'Optional “Cancel for Any Reason” (CFAR) coverage is highly recommended for maximum flexibility. CFAR policies are typically required to be purchased within 14 days of the initial deposit, and participants are solely responsible for verifying eligibility and policy requirements.',
          'The company may suggest insurance providers upon request, but assumes no responsibility for coverage selection, claims, or outcomes.',
        ],
      },
      {
        title: '4. Group Reservations',
        items: [
          'The person making the booking confirms that they have full authorization from all participants included in the reservation to accept these Terms & Conditions on their behalf.',
          'The primary guest is responsible for communicating all trip details and policies to all participants, ensuring all information provided is accurate, and ensuring all participants meet travel requirements.',
          'All participants in a group booking are fully bound by these Terms & Conditions once any payment is made.',
        ],
      },
      {
        title: '5. Traveler Responsibilities',
        items: [
          'Each participant is solely responsible for: valid passport and travel documents; visa requirements (if applicable); compliance with immigration laws; any required vaccinations or health regulations; obtaining appropriate travel insurance.',
        ],
      },
      {
        title: '6. Participant Conduct',
        items: [
          'For the safety and wellbeing of all guests, the possession or use of illegal substances is strictly prohibited during the trip.',
          'TOCCA Amalfi Coast reserves the right to remove any participant from the experience, without refund, if their behavior is disruptive, unsafe, illegal, or negatively impacts the group experience.',
        ],
      },
      {
        title: '7. Limitation of Liability',
        items: [
          'TOCCA Amalfi Coast acts solely as an organizer of travel experiences and is not responsible for: flight delays or cancellations; lost or delayed luggage; personal injury, illness, or accidents; weather conditions; acts of third parties; government restrictions; natural disasters; strikes, pandemics, or force majeure events; any circumstances beyond reasonable control.',
          'The company reserves the right to modify itineraries, accommodations, or activities when necessary due to operational, safety, or external factors.',
        ],
      },
      {
        title: '8. Photo & Media Release',
        items: [
          'By participating in this trip, you grant TOCCA Amalfi Coast permission to photograph and/or record video content during the experience.',
          'You authorize the use of your image, likeness, voice, and appearance in photos or videos for marketing, promotional, and commercial purposes, including but not limited to social media, websites, advertising, and publications, without compensation.',
          'You understand and agree that all media becomes the exclusive property of TOCCA Amalfi Coast and waive any right to review, approve, or receive payment for its use.',
        ],
      },
      {
        title: '9. Acceptance of Terms',
        items: [
          'By completing any payment, the client confirms that they have read and understood these Terms & Conditions, accept the cancellation and payment policies in full, and agree to be legally bound by this agreement on behalf of all participants included in the booking.',
        ],
      },
    ],
  },
  es: {
    heading: 'Términos y Condiciones',
    intro:
      'Al realizar cualquier pago hacia la experiencia TOCCA Amalfi Coast, el cliente confirma que ha leído, entendido y aceptado plenamente estos Términos y Condiciones en su nombre y en el de todos los participantes incluidos en la reserva.',
    back: 'Volver',
    sections: [
      {
        title: '1. Reserva y condiciones de pago',
        items: [
          'Para asegurar un lugar se requiere un depósito no reembolsable y no transferible por persona. El monto se confirma al momento de reservar.',
          'Tras el depósito inicial, se requiere un segundo pago no reembolsable y no transferible del 30% del costo total del viaje para confirmar la participación.',
          'El saldo restante del 70% debe pagarse a más tardar cuarenta y cinco (45) días antes de la fecha oficial de inicio del viaje. No completar el pago a tiempo puede resultar en la cancelación de la reserva sin reembolso de los montos ya pagados.',
        ],
      },
      {
        title: '2. Política de cancelación y reembolsos',
        items: [
          'El depósito inicial y el pago de confirmación del 30% son estrictamente no reembolsables y no transferibles bajo ninguna circunstancia.',
          'El pago final del 70% es reembolsable solo si la cancelación se realiza al menos treinta y cinco (35) días antes de la fecha de inicio del viaje.',
          'Las cancelaciones realizadas dentro de los 35 días previos a la salida no son elegibles para ningún reembolso, sin importar el motivo.',
          'No se emitirán reembolsos por: llegadas tardías o salidas anticipadas; vuelos perdidos o interrupciones de viaje; enfermedad o condiciones médicas; decisiones personales o cambios de planes; condiciones climáticas; restricciones gubernamentales o prohibiciones de viaje; eventos de fuerza mayor o circunstancias fuera del control de la empresa.',
        ],
      },
      {
        title: '3. Seguro de viaje (muy recomendado)',
        items: [
          'TOCCA Amalfi Coast recomienda encarecidamente que todos los participantes adquieran un seguro de viaje integral con un proveedor externo para proteger su inversión.',
          'Se recomienda la cobertura opcional “Cancelación por cualquier motivo” (CFAR) para máxima flexibilidad. Estas pólizas suelen requerir compra dentro de los 14 días posteriores al depósito inicial, y los participantes son los únicos responsables de verificar elegibilidad y requisitos.',
          'La empresa puede sugerir proveedores de seguros si se le solicita, pero no asume responsabilidad por la selección de cobertura, reclamos o resultados.',
        ],
      },
      {
        title: '4. Reservas grupales',
        items: [
          'La persona que realiza la reserva confirma que cuenta con la autorización de todos los participantes incluidos para aceptar estos Términos y Condiciones en su nombre.',
          'El huésped principal es responsable de comunicar todos los detalles y políticas del viaje a todos los participantes, asegurar que la información proporcionada sea correcta y que todos cumplan los requisitos de viaje.',
          'Todos los participantes de una reserva grupal quedan plenamente sujetos a estos Términos y Condiciones una vez realizado cualquier pago.',
        ],
      },
      {
        title: '5. Responsabilidades del viajero',
        items: [
          'Cada participante es el único responsable de: pasaporte y documentos de viaje válidos; requisitos de visa (si aplica); cumplimiento de las leyes migratorias; vacunas o regulaciones sanitarias requeridas; obtener el seguro de viaje adecuado.',
        ],
      },
      {
        title: '6. Conducta del participante',
        items: [
          'Por la seguridad y el bienestar de todos los huéspedes, la posesión o el uso de sustancias ilegales está estrictamente prohibido durante el viaje.',
          'TOCCA Amalfi Coast se reserva el derecho de retirar a cualquier participante de la experiencia, sin reembolso, si su comportamiento es disruptivo, inseguro, ilegal o afecta negativamente la experiencia del grupo.',
        ],
      },
      {
        title: '7. Limitación de responsabilidad',
        items: [
          'TOCCA Amalfi Coast actúa únicamente como organizador de experiencias de viaje y no es responsable de: retrasos o cancelaciones de vuelos; equipaje perdido o retrasado; lesiones personales, enfermedades o accidentes; condiciones climáticas; actos de terceros; restricciones gubernamentales; desastres naturales; huelgas, pandemias o eventos de fuerza mayor; cualquier circunstancia fuera de control razonable.',
          'La empresa se reserva el derecho de modificar itinerarios, alojamientos o actividades cuando sea necesario por factores operativos, de seguridad o externos.',
        ],
      },
      {
        title: '8. Autorización de fotos y medios',
        items: [
          'Al participar en este viaje, otorgas a TOCCA Amalfi Coast permiso para fotografiar y/o grabar contenido de video durante la experiencia.',
          'Autorizas el uso de tu imagen, semejanza, voz y apariencia en fotos o videos con fines de marketing, promoción y comerciales, incluyendo redes sociales, sitios web, publicidad y publicaciones, sin compensación.',
          'Entiendes y aceptas que todo el material pasa a ser propiedad exclusiva de TOCCA Amalfi Coast y renuncias a cualquier derecho de revisión, aprobación o pago por su uso.',
        ],
      },
      {
        title: '9. Aceptación de los términos',
        items: [
          'Al completar cualquier pago, el cliente confirma que ha leído y entendido estos Términos y Condiciones, acepta en su totalidad las políticas de pago y cancelación, y acuerda quedar legalmente vinculado por este acuerdo en nombre de todos los participantes incluidos en la reserva.',
        ],
      },
    ],
  },
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const c = CONTENT[locale] ?? CONTENT.en

  return (
    <div className="mx-auto max-w-2xl px-5 py-8">
      <Link
        href={`/${locale}/login`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-mist transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        {c.back}
      </Link>

      <p className="text-[0.65rem] tracking-[0.3em] text-gold uppercase">Tocca Amalfi Coast</p>
      <h1
        className="mt-1 text-3xl text-foreground"
        style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
      >
        {c.heading}
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-mist">{c.intro}</p>

      <div className="mt-8 space-y-7">
        {c.sections.map((s) => (
          <section key={s.title}>
            <h2
              className="mb-2 text-lg text-foreground"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
            >
              {s.title}
            </h2>
            <ul className="space-y-2">
              {s.items.map((item, i) => (
                <li key={i} className="text-sm leading-relaxed text-mist">
                  {item}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
