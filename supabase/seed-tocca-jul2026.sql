-- ══════════════════════════════════════════════════
-- Tocca Amalfi Coast — Seed de PRUEBA (Jul 17–20, 2026)
-- Datos reales enviados por la clienta. Para probar el portal.
-- ══════════════════════════════════════════════════
-- INSTRUCCIONES:
-- 1. Crea (o reutiliza) un usuario en Supabase > Authentication > Users
--    y copia su UUID.
-- 2. Reemplaza LEAD_USER_UUID abajo con ese UUID.
-- 3. Corre este archivo completo en Supabase > SQL Editor.
--
-- NOTA: todos los UUID usan el prefijo 'f...' para identificar este set
--       de prueba. Para borrarlo: delete from bookings where id =
--       'faaa0000-0000-0000-0000-000000000001'; (cascada limpia el resto).
--
-- NOTA de mapeo de cursos: el enum meal_course sólo tiene
--   starter / main / dessert. El menú de Positano (Jul 19) tiene
--   antipasto + pasta + secondo + dessert, así que 'pasta' y 'secondo'
--   se modelan ambos como 'main' (se distinguen en el nombre).
-- ══════════════════════════════════════════════════

\set lead_uid 'LEAD_USER_UUID'

begin;

-- ── Booking de prueba ──────────────────────────────
insert into bookings (id, user_id, status, type, title, description, start_date, end_date, applicant_name, applicant_email)
values (
  'faaa0000-0000-0000-0000-000000000001',
  :'lead_uid',
  'approved',
  'group',
  '{"en":"Tocca Amalfi Coast — July 2026 (TEST)","es":"Tocca Costa Amalfitana — Julio 2026 (PRUEBA)"}',
  '{"en":"4-day journey along the Amalfi Coast: Maiori, Minori, Positano, Amalfi & Atrani.","es":"Recorrido de 4 días por la Costa Amalfitana: Maiori, Minori, Positano, Amalfi y Atrani."}',
  '2026-07-17',
  '2026-07-20',
  'CLIENTA TEST',
  'test@tocca.example'
);

-- ── Viajeros de prueba (para probar selección de menús) ─
insert into travelers (id, booking_id, type, first_name, last_name) values
  ('fbbb0000-0000-0000-0000-000000000001', 'faaa0000-0000-0000-0000-000000000001', 'adult', 'Guest', 'One'),
  ('fbbb0000-0000-0000-0000-000000000002', 'faaa0000-0000-0000-0000-000000000001', 'adult', 'Guest', 'Two');

-- ── Días del itinerario ────────────────────────────
insert into journey_days (id, booking_id, day_number, title, description, location) values
(
  'fccc0000-0000-0000-0000-000000000001',
  'faaa0000-0000-0000-0000-000000000001',
  1,
  '{"en":"Arrival to the Amalfi Coast","es":"Llegada a la Costa Amalfitana"}',
  '{"en":"Arrival at Naples Airport (10:00–11:40) and private coastal transfer to Maiori. Check-in at Hotel Pietra di Luna. 7:00 PM welcome cocktail on the terrace, then welcome dinner along Maiori''s main corso.","es":"Llegada al aeropuerto de Nápoles (10:00–11:40) y traslado privado por la costa a Maiori. Check-in en el Hotel Pietra di Luna. Cóctel de bienvenida en la terraza a las 19:00 y cena de bienvenida por el corso de Maiori."}',
  'Maiori'
),
(
  'fccc0000-0000-0000-0000-000000000002',
  'faaa0000-0000-0000-0000-000000000001',
  2,
  '{"en":"Slow Morning & Lemon Trail Experience","es":"Mañana tranquila y experiencia del Sendero del Limón"}',
  '{"en":"Relaxed morning in Maiori. 2:30 PM gathering at the hotel lobby, then the Maiori–Minori lemon path walk through lemon groves and hidden pathways, a visit to a generational lemon property, and a lemon-inspired dinner.","es":"Mañana relajada en Maiori. Encuentro en el lobby a las 14:30 y caminata por el sendero del limón Maiori–Minori entre limoneros y senderos escondidos, visita a una finca familiar de limones y cena inspirada en el limón."}',
  'Maiori → Minori'
),
(
  'fccc0000-0000-0000-0000-000000000003',
  'faaa0000-0000-0000-0000-000000000001',
  3,
  '{"en":"Positano, Conca dei Marini & Ceramic Heritage","es":"Positano, Conca dei Marini y herencia cerámica"}',
  '{"en":"2:30 PM private transfer toward Positano with a stop at a ceramic atelier in Conca dei Marini. Free time in Positano, then dinner overlooking the panorama (courses chosen in advance).","es":"Traslado privado hacia Positano a las 14:30 con parada en un taller de cerámica en Conca dei Marini. Tiempo libre en Positano y cena con vista al panorama (platos elegidos con antelación)."}',
  'Positano'
),
(
  'fccc0000-0000-0000-0000-000000000004',
  'faaa0000-0000-0000-0000-000000000001',
  4,
  '{"en":"Amalfi, Atrani & Pizza Experience","es":"Amalfi, Atrani y experiencia de pizza"}',
  '{"en":"1:35 PM ferry from Maiori to Amalfi. Explore Amalfi''s cathedral and piazza, walk to Atrani, then a hands-on pizza & mozzarella cooking experience before returning to Maiori.","es":"Ferry de Maiori a Amalfi a las 13:35. Recorrido por la catedral y la piazza de Amalfi, caminata a Atrani y experiencia práctica de pizza y mozzarella antes de regresar a Maiori."}',
  'Amalfi → Atrani'
);

-- ── Menús (meals) ──────────────────────────────────
-- Día 1 — Welcome Dinner: elegir Menú Vegetariano o Menú de Pescado
insert into meals (id, journey_day_id, course, name, description) values
('fddd0000-0000-0000-0000-000000000101', 'fccc0000-0000-0000-0000-000000000001', 'starter',
  '{"en":"Burrata (Vegetarian menu)","es":"Burrata (menú vegetariano)"}',
  '{"en":"Vegetarian menu starter.","es":"Entrada del menú vegetariano."}'),
('fddd0000-0000-0000-0000-000000000102', 'fccc0000-0000-0000-0000-000000000001', 'starter',
  '{"en":"Stuffed Provoleta (Fish menu)","es":"Provoleta rellena (menú de pescado)"}',
  '{"en":"Fish menu starter.","es":"Entrada del menú de pescado."}'),
('fddd0000-0000-0000-0000-000000000103', 'fccc0000-0000-0000-0000-000000000001', 'main',
  '{"en":"Amalfi Ravioli (Vegetarian menu)","es":"Ravioli de Amalfi (menú vegetariano)"}',
  '{"en":"Vegetarian menu main.","es":"Principal del menú vegetariano."}'),
('fddd0000-0000-0000-0000-000000000104', 'fccc0000-0000-0000-0000-000000000001', 'main',
  '{"en":"Gnocchi with clams and lemon (Fish menu)","es":"Gnocchi con almejas y limón (menú de pescado)"}',
  '{"en":"Fish menu main.","es":"Principal del menú de pescado."}');

-- Día 2 — Lemon-Inspired Dinner: sin elección, sólo se coloca
insert into meals (id, journey_day_id, course, name, description) values
('fddd0000-0000-0000-0000-000000000201', 'fccc0000-0000-0000-0000-000000000002', 'main',
  '{"en":"Lemon-Inspired Dinner","es":"Cena inspirada en el limón"}',
  '{"en":"Set dinner highlighting Amalfi lemon dishes. No selection required.","es":"Cena fija que resalta los platos de limón de Amalfi. No requiere elección."}');

-- Día 3 — Positano Dinner: antipasto + pasta + secondo + dessert
insert into meals (id, journey_day_id, course, name, description) values
-- Antipasti (starter)
('fddd0000-0000-0000-0000-000000000301', 'fccc0000-0000-0000-0000-000000000003', 'starter',
  '{"en":"Caprese di Bufala","es":"Caprese di Bufala"}',
  '{"en":"Buffalo Caprese with tomato varieties, basil pesto and corn fresella bread.","es":"Caprese de búfala con variedades de tomate, pesto de albahaca y fresella de maíz."}'),
('fddd0000-0000-0000-0000-000000000302', 'fccc0000-0000-0000-0000-000000000003', 'starter',
  '{"en":"Fiore di zucchina ripieno","es":"Flor de calabacín rellena"}',
  '{"en":"Zucchini flower stuffed with ricotta, fiordilatte and zucchini on tomato mayonnaise. (Vegetarian)","es":"Flor de calabacín rellena de ricotta, fiordilatte y calabacín sobre mayonesa de tomate. (Vegetariano)"}'),
-- Pasta (main)
('fddd0000-0000-0000-0000-000000000303', 'fccc0000-0000-0000-0000-000000000003', 'main',
  '{"en":"Primo — Linguine ai sapori della Costiera","es":"Primo — Linguine ai sapori della Costiera"}',
  '{"en":"Linguine with seafood, shrimps, scampi and squid.","es":"Linguine con mariscos, gambas, cigalas y calamar."}'),
('fddd0000-0000-0000-0000-000000000304', 'fccc0000-0000-0000-0000-000000000003', 'main',
  '{"en":"Primo — Spaghettoni al limone e crudo di tonno rosso","es":"Primo — Spaghettoni al limón y crudo de atún rojo"}',
  '{"en":"Fresh lemon-scented spaghettoni with raw red tuna.","es":"Spaghettoni frescos al aroma de limón con atún rojo crudo."}'),
('fddd0000-0000-0000-0000-000000000305', 'fccc0000-0000-0000-0000-000000000003', 'main',
  '{"en":"Primo — Spaghetto al pomodoro del Piennolo e ricotta","es":"Primo — Spaghetto al pomodoro del Piennolo y ricotta"}',
  '{"en":"Spaghetti with Piennolo tomato sauce and ricotta. (Vegetarian)","es":"Spaghetti con salsa de tomate Piennolo y ricotta. (Vegetariano)"}'),
('fddd0000-0000-0000-0000-000000000306', 'fccc0000-0000-0000-0000-000000000003', 'main',
  '{"en":"Primo — Ravioli di barbabietola","es":"Primo — Ravioli de remolacha"}',
  '{"en":"Beet ravioli filled with cashew cream, citrus sauce. (Vegetarian)","es":"Ravioli de remolacha rellenos de crema de anacardos, salsa de cítricos. (Vegetariano)"}'),
-- Secondo (main)
('fddd0000-0000-0000-0000-000000000307', 'fccc0000-0000-0000-0000-000000000003', 'main',
  '{"en":"Secondo — Parmigiana di pescato del giorno","es":"Secondo — Parmigiana del pescado del día"}',
  '{"en":"Fresh catch of the day, Parmigiana style, with fried eggplant.","es":"Pescado del día en parmigiana con berenjena frita."}'),
('fddd0000-0000-0000-0000-000000000308', 'fccc0000-0000-0000-0000-000000000003', 'main',
  '{"en":"Secondo — Petto di pollo ripieno al limone","es":"Secondo — Pechuga de pollo rellena al limón"}',
  '{"en":"Slow-cooked lemon-stuffed chicken breast with marinated purple cabbage.","es":"Pechuga de pollo a baja temperatura rellena al limón con col morada marinada."}'),
-- Dessert
('fddd0000-0000-0000-0000-000000000309', 'fccc0000-0000-0000-0000-000000000003', 'dessert',
  '{"en":"Tiramisù","es":"Tiramisù"}',
  '{"en":"With coffee sponge, Grand Marnier and bitter cocoa.","es":"Con pandispagna al café, Grand Marnier y cacao amargo."}'),
('fddd0000-0000-0000-0000-000000000310', 'fccc0000-0000-0000-0000-000000000003', 'dessert',
  '{"en":"Delizia al Limone","es":"Delizia al Limone"}',
  '{"en":"Limoncello-scented sponge cake with lemon Chantilly cream.","es":"Bizcocho al limoncello con crema Chantilly de limón."}');

-- Día 4 — Pizza & Mozzarella: sin elección, la experiencia es la cena
insert into meals (id, journey_day_id, course, name, description) values
('fddd0000-0000-0000-0000-000000000401', 'fccc0000-0000-0000-0000-000000000004', 'main',
  '{"en":"Pizza & Mozzarella Experience","es":"Experiencia de pizza y mozzarella"}',
  '{"en":"Hands-on pizza and fresh mozzarella cooking experience — this is dinner. No selection required.","es":"Experiencia práctica de pizza y mozzarella fresca — es la cena. No requiere elección."}');

-- ── Actividades / experiencias del catálogo ────────
-- precio y capacidad: PENDIENTE de confirmar con la clienta (placeholder 0 / null)
insert into activities (id, name, description, price, capacity, active) values
(
  'feee0000-0000-0000-0000-000000000001',
  '{"en":"Lemon Trail Experience","es":"Experiencia del Sendero del Limón"}',
  '{"en":"Visit a generational Amalfi lemon property near Minori: cultivation, family traditions and local products.","es":"Visita a una finca familiar de limones de Amalfi cerca de Minori: cultivo, tradiciones familiares y productos locales."}',
  0.00, null, true
),
(
  'feee0000-0000-0000-0000-000000000002',
  '{"en":"Amalfi Ceramics Atelier — Conca dei Marini","es":"Taller de cerámica de Amalfi — Conca dei Marini"}',
  '{"en":"Visit an emblematic ceramic atelier: explore the collections and the history and artistry of Amalfi ceramics.","es":"Visita a un taller de cerámica emblemático: colecciones e historia del arte cerámico de Amalfi."}',
  0.00, null, true
),
(
  'feee0000-0000-0000-0000-000000000003',
  '{"en":"Pizza & Mozzarella Cooking Class","es":"Clase de cocina de pizza y mozzarella"}',
  '{"en":"Hands-on class: traditional pizza-making techniques and fresh mozzarella preparation.","es":"Clase práctica: técnicas tradicionales de pizza y preparación de mozzarella fresca."}',
  0.00, null, true
),
(
  'feee0000-0000-0000-0000-000000000004',
  '{"en":"Maiori–Minori Lemon Path Walk","es":"Caminata del sendero del limón Maiori–Minori"}',
  '{"en":"Scenic walk connecting Maiori and Minori through lemon groves, hidden pathways and coastline views.","es":"Caminata escénica que une Maiori y Minori entre limoneros, senderos escondidos y vistas a la costa."}',
  0.00, null, true
),
(
  'feee0000-0000-0000-0000-000000000005',
  '{"en":"Ferry Maiori → Amalfi & Atrani Walk","es":"Ferry Maiori → Amalfi y caminata a Atrani"}',
  '{"en":"Ferry from Maiori to Amalfi with coastal views, town exploration, and a walk to Atrani — the smallest village in Italy.","es":"Ferry de Maiori a Amalfi con vistas costeras, recorrido del pueblo y caminata a Atrani, el pueblo más pequeño de Italia."}',
  0.00, null, true
);

commit;

-- ══════════════════════════════════════════════════
-- Verificación rápida (opcional):
--   select day_number, title->>'en' from journey_days
--     where booking_id = 'faaa0000-0000-0000-0000-000000000001' order by day_number;
--   select course, name->>'en' from meals
--     where journey_day_id in (select id from journey_days
--       where booking_id = 'faaa0000-0000-0000-0000-000000000001');
-- ══════════════════════════════════════════════════
