-- ══════════════════════════════════════════════════════════════
-- Tocca Amalfi Coast — Guest App SAMPLE content (optional)
-- Run AFTER 0001_guest_app.sql. Safe to re-run (idempotent).
--
-- Images use picsum.photos so the demo renders out of the box.
-- Replace every image_url / gallery URL with your own assets in
-- Supabase Storage (bucket e.g. `media`) when you have them — the
-- app already whitelists *.supabase.co in next.config.ts.
--
-- This script assumes the example booking + days from seed.sql:
--   booking  a1b2c3d4-0000-0000-0000-000000000001
--   days     c0000000-0000-0000-0000-00000000000{1..5}
-- Adjust the IDs if your data differs.
-- ══════════════════════════════════════════════════════════════

-- ── 1. Enrich the 5 itinerary days ───────────────────────────────
update journey_days set
  image_url = 'https://picsum.photos/seed/amalfi-arrival/1200/800',
  schedule = '[
    {"time":"13:00","title":{"en":"Land at Naples Intl. Airport","es":"Aterrizaje en el aeropuerto de Nápoles"}},
    {"time":"14:00","title":{"en":"Private transfer along the coast","es":"Traslado privado por la costa"}},
    {"time":"16:30","title":{"en":"Hotel check-in & rest","es":"Check-in en el hotel y descanso"}},
    {"time":"20:00","title":{"en":"Welcome dinner","es":"Cena de bienvenida"}}
  ]'::jsonb,
  included = '[{"en":"Private transfer","es":"Traslado privado"},{"en":"Welcome dinner","es":"Cena de bienvenida"},{"en":"Hotel concierge","es":"Concierge del hotel"}]'::jsonb,
  meeting_point = '{"en":"Arrivals hall, Naples International Airport (NAP)","es":"Sala de llegadas, Aeropuerto Internacional de Nápoles (NAP)"}'::jsonb,
  day_notes = '{"en":"Your driver will hold a Tocca sign at arrivals.","es":"Tu chofer te esperará con un cartel de Tocca en llegadas."}'::jsonb,
  gallery = '["https://picsum.photos/seed/amalfi-a1/900/700","https://picsum.photos/seed/amalfi-a2/900/700","https://picsum.photos/seed/amalfi-a3/900/700"]'::jsonb
where id = 'c0000000-0000-0000-0000-000000000001';

update journey_days set
  image_url = 'https://picsum.photos/seed/positano-gods/1200/800',
  schedule = '[
    {"time":"08:30","title":{"en":"Transfer to trailhead (Bomerano)","es":"Traslado al inicio del sendero (Bomerano)"}},
    {"time":"09:00","title":{"en":"Path of the Gods hike","es":"Caminata Sendero de los Dioses"}},
    {"time":"13:00","title":{"en":"Lunch in Positano","es":"Almuerzo en Positano"}},
    {"time":"15:30","title":{"en":"Free time on the beach","es":"Tiempo libre en la playa"}}
  ]'::jsonb,
  included = '[{"en":"Local hiking guide","es":"Guía local de senderismo"},{"en":"Lunch","es":"Almuerzo"},{"en":"Return transfer","es":"Traslado de regreso"}]'::jsonb,
  meeting_point = '{"en":"Hotel lobby","es":"Lobby del hotel"}'::jsonb,
  day_notes = '{"en":"Wear comfortable shoes and bring water.","es":"Usa calzado cómodo y trae agua."}'::jsonb,
  gallery = '["https://picsum.photos/seed/positano-1/900/700","https://picsum.photos/seed/positano-2/900/700"]'::jsonb
where id = 'c0000000-0000-0000-0000-000000000002';

update journey_days set
  image_url = 'https://picsum.photos/seed/ravello-wine/1200/800',
  schedule = '[
    {"time":"10:00","title":{"en":"Villa Cimbrone & Villa Rufolo","es":"Villa Cimbrone y Villa Rufolo"}},
    {"time":"13:30","title":{"en":"Lunch with a view","es":"Almuerzo con vista"}},
    {"time":"16:00","title":{"en":"Vineyard wine tasting","es":"Cata de vinos en viñedo"}}
  ]'::jsonb,
  included = '[{"en":"Garden entrance tickets","es":"Entradas a los jardines"},{"en":"Guided wine tasting","es":"Cata de vinos guiada"}]'::jsonb,
  meeting_point = '{"en":"Hotel lobby","es":"Lobby del hotel"}'::jsonb,
  gallery = '["https://picsum.photos/seed/ravello-1/900/700","https://picsum.photos/seed/ravello-2/900/700"]'::jsonb
where id = 'c0000000-0000-0000-0000-000000000003';

update journey_days set
  image_url = 'https://picsum.photos/seed/capri-blue/1200/800',
  schedule = '[
    {"time":"08:00","title":{"en":"Ferry to Capri","es":"Ferry a Capri"}},
    {"time":"10:00","title":{"en":"Blue Grotto","es":"Gruta Azul"}},
    {"time":"13:00","title":{"en":"Lunch & the Piazzetta","es":"Almuerzo y la Piazzetta"}},
    {"time":"18:00","title":{"en":"Return by sunset","es":"Regreso al atardecer"}}
  ]'::jsonb,
  included = '[{"en":"Round-trip ferry","es":"Ferry ida y vuelta"},{"en":"Island guide","es":"Guía de la isla"}]'::jsonb,
  meeting_point = '{"en":"Amalfi ferry dock","es":"Muelle de ferry de Amalfi"}'::jsonb,
  gallery = '["https://picsum.photos/seed/capri-1/900/700","https://picsum.photos/seed/capri-2/900/700"]'::jsonb
where id = 'c0000000-0000-0000-0000-000000000004';

update journey_days set
  image_url = 'https://picsum.photos/seed/amalfi-farewell/1200/800',
  schedule = '[
    {"time":"09:00","title":{"en":"Leisurely breakfast","es":"Desayuno tranquilo"}},
    {"time":"11:00","title":{"en":"Last walk through Amalfi","es":"Última caminata por Amalfi"}},
    {"time":"13:00","title":{"en":"Transfer to Naples airport","es":"Traslado al aeropuerto de Nápoles"}}
  ]'::jsonb,
  included = '[{"en":"Breakfast","es":"Desayuno"},{"en":"Departure transfer","es":"Traslado de salida"}]'::jsonb,
  meeting_point = '{"en":"Hotel lobby","es":"Lobby del hotel"}'::jsonb,
  gallery = '["https://picsum.photos/seed/amalfi-f1/900/700"]'::jsonb
where id = 'c0000000-0000-0000-0000-000000000005';

-- ── 2. Free Day Activities catalog ───────────────────────────────
insert into activities (id, name, description, price, capacity, active, image_url, duration, time_label, overview, included, requirements, cancellation_policy) values
(
  'e1000000-0000-0000-0000-000000000001',
  '{"en":"Private Boat Tour to Capri","es":"Tour privado en barco a Capri"}',
  '{"en":"A private skippered boat along the coast with a stop at the Blue Grotto.","es":"Un barco privado con patrón por la costa con parada en la Gruta Azul."}',
  680.00, 8, true,
  'https://picsum.photos/seed/act-boat/1200/800',
  '{"en":"6 hours","es":"6 horas"}',
  '{"en":"09:00","es":"09:00"}',
  '{"en":"Glide along the Amalfi cliffs on a private boat, swim in hidden coves, and toast with a glass of local wine at sunset.","es":"Navega entre los acantilados de Amalfi en un barco privado, nada en calas escondidas y brinda con una copa de vino local al atardecer."}',
  '[{"en":"Skipper & fuel","es":"Patrón y combustible"},{"en":"Snorkeling gear","es":"Equipo de snorkel"},{"en":"Drinks & snacks","es":"Bebidas y snacks"}]',
  '[{"en":"Swimwear & towel","es":"Traje de baño y toalla"},{"en":"Sunscreen","es":"Protector solar"}]',
  '{"en":"Free cancellation up to 48 hours before. After that, 50% charge.","es":"Cancelación gratuita hasta 48 horas antes. Después, cargo del 50%."}'
),
(
  'e1000000-0000-0000-0000-000000000002',
  '{"en":"Lemon Grove & Limoncello Tasting","es":"Limonar y cata de limoncello"}',
  '{"en":"Walk a terraced lemon grove and taste homemade limoncello.","es":"Recorre un limonar en terrazas y prueba limoncello casero."}',
  120.00, 12, true,
  'https://picsum.photos/seed/act-lemon/1200/800',
  '{"en":"2.5 hours","es":"2.5 horas"}',
  '{"en":"Afternoon","es":"Tarde"}',
  '{"en":"Discover the famous Sfusato Amalfitano lemons, learn how limoncello is made, and enjoy a tasting with local pastries.","es":"Descubre los famosos limones Sfusato Amalfitano, aprende cómo se hace el limoncello y disfruta una cata con dulces locales."}',
  '[{"en":"Guided grove walk","es":"Caminata guiada por el limonar"},{"en":"Limoncello tasting","es":"Cata de limoncello"},{"en":"Local pastries","es":"Dulces locales"}]',
  '[{"en":"Comfortable shoes","es":"Calzado cómodo"}]',
  '{"en":"Free cancellation up to 24 hours before.","es":"Cancelación gratuita hasta 24 horas antes."}'
),
(
  'e1000000-0000-0000-0000-000000000003',
  '{"en":"Sunset Vespa Coastal Ride","es":"Paseo en Vespa al atardecer por la costa"}',
  '{"en":"A guided Vespa ride along the coastal road at golden hour.","es":"Un paseo guiado en Vespa por la carretera costera a la hora dorada."}',
  210.00, 6, true,
  'https://picsum.photos/seed/act-vespa/1200/800',
  '{"en":"3 hours","es":"3 horas"}',
  '{"en":"17:30","es":"17:30"}',
  '{"en":"Ride pillion or solo on a classic Vespa, stopping at the most photogenic viewpoints of the Amalfi Coast.","es":"Viaja de pasajero o solo en una Vespa clásica, con paradas en los miradores más fotogénicos de la Costa Amalfitana."}',
  '[{"en":"Vespa & helmet","es":"Vespa y casco"},{"en":"Local guide","es":"Guía local"},{"en":"Photo stops","es":"Paradas para fotos"}]',
  '[{"en":"Valid driving licence (to ride solo)","es":"Licencia de conducir válida (para conducir solo)"},{"en":"Closed shoes","es":"Zapatos cerrados"}]',
  '{"en":"Free cancellation up to 48 hours before. Weather-dependent.","es":"Cancelación gratuita hasta 48 horas antes. Sujeto al clima."}'
)
on conflict (id) do nothing;

-- ── 3. Wellness options ──────────────────────────────────────────
insert into wellness_options (id, name, description, active, image_url, duration, price) values
(
  'f1000000-0000-0000-0000-000000000001',
  '{"en":"Gym Day Access","es":"Acceso al gimnasio por el día"}',
  '{"en":"Full-day access to the hotel fitness centre with sea-view cardio deck.","es":"Acceso de día completo al centro de fitness del hotel con zona de cardio con vista al mar."}',
  true, 'https://picsum.photos/seed/well-gym/1200/800',
  '{"en":"All day","es":"Todo el día"}', 0.00
),
(
  'f1000000-0000-0000-0000-000000000002',
  '{"en":"Signature Spa Treatment","es":"Tratamiento de spa exclusivo"}',
  '{"en":"A 90-minute Mediterranean ritual with citrus and olive oils.","es":"Un ritual mediterráneo de 90 minutos con aceites de cítricos y oliva."}',
  true, 'https://picsum.photos/seed/well-spa/1200/800',
  '{"en":"90 min","es":"90 min"}', 180.00
),
(
  'f1000000-0000-0000-0000-000000000003',
  '{"en":"Private Yoga Session","es":"Sesión privada de yoga"}',
  '{"en":"A sunrise terrace yoga session with a private instructor.","es":"Una sesión de yoga en terraza al amanecer con instructor privado."}',
  true, 'https://picsum.photos/seed/well-yoga/1200/800',
  '{"en":"60 min","es":"60 min"}', 95.00
),
(
  'f1000000-0000-0000-0000-000000000004',
  '{"en":"Massage Therapy","es":"Terapia de masaje"}',
  '{"en":"A tailored deep-tissue or relaxing massage in your suite.","es":"Un masaje de tejido profundo o relajante a medida en tu suite."}',
  true, 'https://picsum.photos/seed/well-massage/1200/800',
  '{"en":"60 min","es":"60 min"}', 130.00
)
on conflict (id) do nothing;

-- ── 4. Travel timeline events for the example booking ────────────
insert into timeline_events (id, booking_id, sort_order, event_date, event_time, type, title, description, location) values
('71000000-0000-0000-0000-000000000001','a1b2c3d4-0000-0000-0000-000000000001',10,'2026-06-28','11:45','flight','{"en":"Flight to Naples (NAP)","es":"Vuelo a Nápoles (NAP)"}','{"en":"International arrival","es":"Llegada internacional"}','Naples'),
('71000000-0000-0000-0000-000000000002','a1b2c3d4-0000-0000-0000-000000000001',20,'2026-06-28','14:00','transfer','{"en":"Private transfer to Amalfi","es":"Traslado privado a Amalfi"}','{"en":"Scenic coastal road","es":"Carretera costera panorámica"}','NAP → Amalfi'),
('71000000-0000-0000-0000-000000000003','a1b2c3d4-0000-0000-0000-000000000001',30,'2026-06-28','16:30','accommodation','{"en":"Check-in: Amalfi hotel","es":"Check-in: hotel en Amalfi"}','{"en":"3 nights","es":"3 noches"}','Amalfi'),
('71000000-0000-0000-0000-000000000004','a1b2c3d4-0000-0000-0000-000000000001',40,'2026-06-29','09:00','experience','{"en":"Path of the Gods & Positano","es":"Sendero de los Dioses y Positano"}','{"en":"Guided hike + free time","es":"Caminata guiada + tiempo libre"}','Positano'),
('71000000-0000-0000-0000-000000000005','a1b2c3d4-0000-0000-0000-000000000001',50,'2026-07-01','16:30','accommodation','{"en":"Move to Capri","es":"Traslado a Capri"}','{"en":"1 night","es":"1 noche"}','Capri'),
('71000000-0000-0000-0000-000000000006','a1b2c3d4-0000-0000-0000-000000000001',60,'2026-07-02','13:00','transfer','{"en":"Transfer to Naples airport","es":"Traslado al aeropuerto de Nápoles"}','{"en":"Departure","es":"Salida"}','Capri → NAP'),
('71000000-0000-0000-0000-000000000007','a1b2c3d4-0000-0000-0000-000000000001',70,'2026-07-02','16:20','flight','{"en":"Departing flight","es":"Vuelo de salida"}','{"en":"Safe travels","es":"Buen viaje"}','Naples')
on conflict (id) do nothing;

-- ── done ─────────────────────────────────────────────────────────
