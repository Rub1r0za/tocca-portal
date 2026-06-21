-- ══════════════════════════════════════════════════
-- Tocca — Seed de ejemplo para un grupo
-- ══════════════════════════════════════════════════
-- INSTRUCCIONES:
-- 1. Crea el usuario lead en Supabase > Authentication > Users
--    con su correo real. Copia el UUID generado.
-- 2. Reemplaza LEAD_USER_UUID con ese UUID.
-- 3. Corre en Supabase SQL Editor.
-- ══════════════════════════════════════════════════

-- Ajusta este UUID al del usuario real:
\set lead_uid 'LEAD_USER_UUID'

-- Booking del grupo
insert into bookings (id, user_id, status, type, title, description, start_date, end_date, applicant_name, applicant_email)
values (
  'a1b2c3d4-0000-0000-0000-000000000001',
  :'lead_uid',
  'approved',
  'group',
  '{"en": "Amalfi Coast Retreat — June 2026", "es": "Retiro Costa Amalfitana — Junio 2026"}',
  '{"en": "A curated 5-day journey along the Amalfi Coast.", "es": "Un recorrido de 5 días por la Costa Amalfitana."}',
  '2026-06-28',
  '2026-07-02',
  'NOMBRE DEL LEAD',       -- <-- reemplaza
  'CORREO DEL LEAD'        -- <-- reemplaza
);

-- Viajeros del grupo
insert into travelers (id, booking_id, type, first_name, last_name) values
  ('b0000000-0000-0000-0000-000000000001', 'a1b2c3d4-0000-0000-0000-000000000001', 'adult', 'NOMBRE_1', 'APELLIDO_1'),
  ('b0000000-0000-0000-0000-000000000002', 'a1b2c3d4-0000-0000-0000-000000000001', 'adult', 'NOMBRE_2', 'APELLIDO_2'),
  ('b0000000-0000-0000-0000-000000000003', 'a1b2c3d4-0000-0000-0000-000000000001', 'adult', 'NOMBRE_3', 'APELLIDO_3');

-- Días del itinerario (5 días)
insert into journey_days (id, booking_id, day_number, title, description, location) values
(
  'c0000000-0000-0000-0000-000000000001',
  'a1b2c3d4-0000-0000-0000-000000000001',
  1,
  '{"en": "Arrival in Naples & Transfer to Amalfi", "es": "Llegada a Nápoles y traslado a Amalfi"}',
  '{"en": "Land at Naples International Airport. Private transfer along the scenic coastal road to your hotel in Amalfi. Evening welcome dinner.", "es": "Aterrizaje en el aeropuerto de Nápoles. Traslado privado por la carretera costera hasta tu hotel en Amalfi. Cena de bienvenida."}',
  'Amalfi'
),
(
  'c0000000-0000-0000-0000-000000000002',
  'a1b2c3d4-0000-0000-0000-000000000001',
  2,
  '{"en": "Positano & Path of the Gods", "es": "Positano y el Sendero de los Dioses"}',
  '{"en": "Morning hike on the Sentiero degli Dei with panoramic views of the coast. Afternoon in Positano — explore the village, the beach, and the ceramic shops.", "es": "Caminata matutina por el Sentiero degli Dei con vistas panorámicas de la costa. Tarde en Positano: el pueblo, la playa y las tiendas de cerámica."}',
  'Positano'
),
(
  'c0000000-0000-0000-0000-000000000003',
  'a1b2c3d4-0000-0000-0000-000000000001',
  3,
  '{"en": "Ravello & Wine Tasting", "es": "Ravello y cata de vinos"}',
  '{"en": "Visit Villa Cimbrone and Villa Rufolo in Ravello. Afternoon wine tasting at a local vineyard overlooking the sea.", "es": "Visita a Villa Cimbrone y Villa Rufolo en Ravello. Tarde de cata de vinos en un viñedo local con vista al mar."}',
  'Ravello'
),
(
  'c0000000-0000-0000-0000-000000000004',
  'a1b2c3d4-0000-0000-0000-000000000001',
  4,
  '{"en": "Capri Day Trip", "es": "Excursión a Capri"}',
  '{"en": "Ferry to Capri. Visit the Blue Grotto, walk the Villa Jovis trail, and browse the Piazzetta. Return by sunset.", "es": "Ferry a Capri. Visita a la Gruta Azul, caminata por Villa Jovis y la Piazzetta. Regreso al atardecer."}',
  'Capri'
),
(
  'c0000000-0000-0000-0000-000000000005',
  'a1b2c3d4-0000-0000-0000-000000000001',
  5,
  '{"en": "Farewell Morning & Departure", "es": "Mañana de despedida y salida"}',
  '{"en": "Leisurely breakfast and last walk through Amalfi's cathedral square. Transfer back to Naples for your departing flight.", "es": "Desayuno tranquilo y última caminata por la plaza de la catedral de Amalfi. Traslado de regreso a Nápoles."}',
  'Amalfi'
);

-- Comidas: 3 cursos por día (5 días × 3 = 15 meals con opciones)
-- Día 1
insert into meals (id, journey_day_id, course, name, description) values
('d1000001', 'c0000000-0000-0000-0000-000000000001', 'starter',
  '{"en":"Burrata con limón","es":"Burrata con limón"}',
  '{"en":"Creamy burrata with Amalfi lemon zest and basil oil","es":"Burrata cremosa con ralladura de limón de Amalfi y aceite de albahaca"}'),
('d1000002', 'c0000000-0000-0000-0000-000000000001', 'starter',
  '{"en":"Polpo alla luciana","es":"Pulpo a la luciana"}',
  '{"en":"Slow-cooked octopus with tomato and capers","es":"Pulpo cocido a fuego lento con tomate y alcaparras"}'),
('d1000003', 'c0000000-0000-0000-0000-000000000001', 'main',
  '{"en":"Spaghetti alle vongole","es":"Spaghetti a las almejas"}',
  '{"en":"Classic clam pasta with white wine and parsley","es":"Pasta clásica con almejas, vino blanco y perejil"}'),
('d1000004', 'c0000000-0000-0000-0000-000000000001', 'main',
  '{"en":"Branzino al forno","es":"Lubina al horno"}',
  '{"en":"Oven-roasted sea bass with herbs and lemon","es":"Lubina asada con hierbas y limón"}'),
('d1000005', 'c0000000-0000-0000-0000-000000000001', 'dessert',
  '{"en":"Delizia al limone","es":"Delizia al limone"}',
  '{"en":"Amalfi lemon sponge cake with cream","es":"Bizcocho de limón de Amalfi con crema"}'),
('d1000006', 'c0000000-0000-0000-0000-000000000001', 'dessert',
  '{"en":"Torta caprese","es":"Torta caprese"}',
  '{"en":"Flourless chocolate-almond cake","es":"Pastel de chocolate y almendras sin harina"}');

-- Día 2
insert into meals (id, journey_day_id, course, name, description) values
('d2000001', 'c0000000-0000-0000-0000-000000000002', 'starter',
  '{"en":"Insalata di mare","es":"Ensalada de mar"}',
  '{"en":"Chilled seafood salad with lemon dressing","es":"Ensalada de mariscos fría con vinagreta de limón"}'),
('d2000002', 'c0000000-0000-0000-0000-000000000002', 'starter',
  '{"en":"Pane e pomodoro","es":"Pan con tomate"}',
  '{"en":"Toasted local bread with heirloom tomatoes and EVOO","es":"Pan tostado local con tomates de temporada y AOVE"}'),
('d2000003', 'c0000000-0000-0000-0000-000000000002', 'main',
  '{"en":"Risotto agli scampi","es":"Risotto con gambas"}',
  '{"en":"Creamy risotto with Amalfi Coast prawns","es":"Risotto cremoso con gambas de la Costa Amalfitana"}'),
('d2000004', 'c0000000-0000-0000-0000-000000000002', 'main',
  '{"en":"Melanzane alla parmigiana","es":"Berenjena a la parmesana"}',
  '{"en":"Classic layered eggplant with tomato and mozzarella","es":"Berenjenas en capas con tomate y mozzarella"}'),
('d2000005', 'c0000000-0000-0000-0000-000000000002', 'dessert',
  '{"en":"Semifreddo al pistacchio","es":"Semifreddo de pistacho"}',
  '{"en":"Pistachio semifreddo with honey drizzle","es":"Semifreddo de pistacho con miel"}'),
('d2000006', 'c0000000-0000-0000-0000-000000000002', 'dessert',
  '{"en":"Panna cotta al miele","es":"Panna cotta al miel"}',
  '{"en":"Honey panna cotta with local wild berries","es":"Panna cotta de miel con frutos del bosque locales"}');

-- Días 3, 4, 5 — mismos cursos simplificados
insert into meals (id, journey_day_id, course, name, description) values
('d3000001','c0000000-0000-0000-0000-000000000003','starter','{"en":"Carpaccio di tonno","es":"Carpaccio de atún"}','{"en":"Thinly sliced tuna with capers and lemon","es":"Atún en láminas finas con alcaparras y limón"}'),
('d3000002','c0000000-0000-0000-0000-000000000003','starter','{"en":"Bruschetta al pomodoro","es":"Bruschetta al tomate"}','{"en":"Grilled bread with tomatoes, garlic, and basil","es":"Pan tostado con tomates, ajo y albahaca"}'),
('d3000003','c0000000-0000-0000-0000-000000000003','main','{"en":"Gnocchi al ragù napoletano","es":"Gnocchi al ragú napolitano"}','{"en":"Potato gnocchi with slow-cooked Neapolitan meat sauce","es":"Gnocchi de papa con ragú napolitano"}'),
('d3000004','c0000000-0000-0000-0000-000000000003','main','{"en":"Pesce all''acqua pazza","es":"Pescado en agua loca"}','{"en":"Fish braised in tomato broth with olives and capers","es":"Pescado braseado en caldo de tomate con aceitunas y alcaparras"}'),
('d3000005','c0000000-0000-0000-0000-000000000003','dessert','{"en":"Profiteroles al cioccolato","es":"Profiteroles al chocolate"}','{"en":"Cream puffs with dark chocolate sauce","es":"Buñuelos de crema con salsa de chocolate negro"}'),
('d3000006','c0000000-0000-0000-0000-000000000003','dessert','{"en":"Cannoli siciliani","es":"Cannoli sicilianos"}','{"en":"Crispy cannoli filled with ricotta and pistachio","es":"Cannoli crujientes rellenos de ricotta y pistacho"}'),
('d4000001','c0000000-0000-0000-0000-000000000004','starter','{"en":"Caprese classica","es":"Ensalada caprese clásica"}','{"en":"Fresh mozzarella, tomato and basil","es":"Mozzarella fresca, tomate y albahaca"}'),
('d4000002','c0000000-0000-0000-0000-000000000004','starter','{"en":"Zuppa di ceci","es":"Sopa de garbanzos"}','{"en":"Chickpea soup with rosemary and EVOO","es":"Sopa de garbanzos con romero y AOVE"}'),
('d4000003','c0000000-0000-0000-0000-000000000004','main','{"en":"Linguine al granchio","es":"Linguine al cangrejo"}','{"en":"Fresh linguine with blue crab and bisque","es":"Linguine frescos con cangrejo azul y bisque"}'),
('d4000004','c0000000-0000-0000-0000-000000000004','main','{"en":"Pollo alla diavola","es":"Pollo alla diavola"}','{"en":"Spatchcocked chicken with peperoncino and herbs","es":"Pollo aplastado con peperoncino y hierbas"}'),
('d4000005','c0000000-0000-0000-0000-000000000004','dessert','{"en":"Babà al rum","es":"Babà al ron"}','{"en":"Classic Neapolitan rum-soaked cake","es":"Clásico bizcocho napolitano empapado en ron"}'),
('d4000006','c0000000-0000-0000-0000-000000000004','dessert','{"en":"Granita al limone","es":"Granita de limón"}','{"en":"Refreshing Amalfi lemon granita","es":"Granita refrescante de limón de Amalfi"}'),
('d5000001','c0000000-0000-0000-0000-000000000005','starter','{"en":"Sfogliatella riccia","es":"Sfogliatella"}','{"en":"Crispy layered pastry with ricotta filling","es":"Pastel hojaldrado crujiente con relleno de ricotta"}'),
('d5000002','c0000000-0000-0000-0000-000000000005','starter','{"en":"Prosciutto e melone","es":"Jamón con melón"}','{"en":"San Daniele prosciutto with ripe cantaloupe","es":"Prosciutto San Daniele con melón cantalupo maduro"}'),
('d5000003','c0000000-0000-0000-0000-000000000005','main','{"en":"Pizza fritta napoletana","es":"Pizza frita napolitana"}','{"en":"Fried pizza dough with ricotta and tomato","es":"Masa de pizza frita con ricotta y tomate"}'),
('d5000004','c0000000-0000-0000-0000-000000000005','main','{"en":"Fritto misto di mare","es":"Fritto misto de mar"}','{"en":"Mixed fried seafood with lemon aioli","es":"Mariscos fritos mixtos con aioli de limón"}'),
('d5000005','c0000000-0000-0000-0000-000000000005','dessert','{"en":"Struffoli napoletani","es":"Struffoli napolitanos"}','{"en":"Honey-glazed fried dough balls","es":"Bolitas de masa fritas bañadas en miel"}'),
('d5000006','c0000000-0000-0000-0000-000000000005','dessert','{"en":"Gelato artigianale","es":"Helado artesanal"}','{"en":"Local artisan gelato: pistachio and fior di latte","es":"Helado artesanal local: pistacho y fior di latte"}');

-- Actividades disponibles
insert into activities (id, name, description, price, capacity, active) values
(
  'e0000000-0000-0000-0000-000000000001',
  '{"en":"Private Boat Tour", "es":"Tour privado en barco"}',
  '{"en":"Explore sea caves, hidden coves, and swim in crystal-clear waters along the coast.", "es":"Explora cuevas marinas, calas escondidas y nada en aguas cristalinas a lo largo de la costa."}',
  180.00, 8, true
),
(
  'e0000000-0000-0000-0000-000000000002',
  '{"en":"Lemon Grove & Limoncello Making", "es":"Huerto de limoneros y Limoncello"}',
  '{"en":"Tour an authentic Amalfi lemon grove and craft your own limoncello to take home.", "es":"Recorre un auténtico huerto de limoneros de Amalfi y elabora tu propio limoncello para llevar."}',
  65.00, 12, true
),
(
  'e0000000-0000-0000-0000-000000000003',
  '{"en":"Ceramics Workshop — Positano", "es":"Taller de cerámica en Positano"}',
  '{"en":"Hand-paint your own majolica tile guided by a local ceramics artist.", "es":"Pinta tu propio azulejo de mayólica guiado por un artista ceramista local."}',
  90.00, 6, true
),
(
  'e0000000-0000-0000-0000-000000000004',
  '{"en":"Cooking Class with a Nonna", "es":"Clase de cocina con una nonna"}',
  '{"en":"Learn to make fresh pasta, gnocchi, and tiramisù in a private home kitchen.", "es":"Aprende a hacer pasta fresca, gnocchi y tiramisù en una cocina doméstica privada."}',
  120.00, 10, true
),
(
  'e0000000-0000-0000-0000-000000000005',
  '{"en":"Sunrise Yoga on the Terrace", "es":"Yoga al amanecer en la terraza"}',
  '{"en":"Start your day with a guided yoga session overlooking the sea.", "es":"Comienza el día con una sesión de yoga guiada con vistas al mar."}',
  40.00, 15, true
),
(
  'e0000000-0000-0000-0000-000000000006',
  '{"en":"Ravello Concert Evening", "es":"Concierto nocturno en Ravello"}',
  '{"en":"Attend a classical music concert in the gardens of Villa Rufolo.", "es":"Asiste a un concierto de música clásica en los jardines de Villa Rufolo."}',
  85.00, 20, true
);
