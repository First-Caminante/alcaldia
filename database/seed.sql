-- ==============================================================================
-- GOBIERNO AUTÓNOMO MUNICIPAL DE PELECHUCO — DATOS SEMILLA (SEED DATA)
-- Compatible con Supabase PostgreSQL y almacenamiento en Cloudflare R2
-- ==============================================================================

-- 1. HERO / PORTADA PRINCIPAL
INSERT INTO public.hero_section (
  id,
  badge_text,
  title_main,
  title_highlight,
  subtitle,
  bg_image_url,
  bg_image_key,
  cta_primary_text,
  cta_primary_link,
  cta_secondary_text,
  cta_secondary_link,
  is_active
) VALUES (
  1,
  'Gobierno Autónomo Municipal · La Paz, Bolivia',
  'Tierra de montañas',
  'y comunidades',
  'Pelechuco, municipio de la provincia Franz Tamayo, departamento de La Paz, Bolivia.',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&q=85',
  'hero/cumbres-pelechuco-portada.webp',
  'Explorar el municipio',
  '#conoce',
  'Ver comunicados',
  '#noticias',
  true
) ON CONFLICT (id) DO UPDATE SET
  title_main = EXCLUDED.title_main,
  title_highlight = EXCLUDED.title_highlight,
  subtitle = EXCLUDED.subtitle,
  bg_image_url = EXCLUDED.bg_image_url;

-- 2. CONOCE PELECHUCO — INTRODUCCIÓN
INSERT INTO public.conoce_intro (
  id,
  title,
  description,
  image_url,
  image_key,
  altitud,
  superficie,
  poblacion,
  cantones_texto
) VALUES (
  1,
  'Territorio andino y corazón de Apolobamba',
  'Pelechuco es la segunda sección municipal de la provincia Franz Tamayo del departamento de La Paz, Bolivia. Se encuentra enclavado en la imponente Cordillera de Apolobamba, albergando una invaluable riqueza cultural, textilería camélida ancestral y vastos ecosistemas protegidos en el Área Natural de Manejo Integrado Nacional Apolobamba.',
  'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80',
  'conoce/valle-andino-intro.webp',
  '3.600 m s. n. m.',
  '2.714 km²',
  '6.850 habitantes',
  '9 Cantones y Ayllus Originarios'
) ON CONFLICT (id) DO UPDATE SET
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url;

-- 3. CONOCE PELECHUCO — SECCIONES TEMÁTICAS (Historia, Cultura, Comunidades)
INSERT INTO public.conoce_secciones (
  slug,
  title,
  subtitle,
  content,
  image_url,
  image_key,
  image_alt,
  display_order,
  is_active
) VALUES
(
  'historia',
  'Historia y Orígenes',
  'Raíces ancestrales y fundación virreinal',
  '<p>Pelechuco tiene raíces históricas que se remontan a las civilizaciones precolombinas kallawayas y quechuas. Fue un punto de tránsito vital entre las tierras altas andinas y los valles yungueños amazónicos. Su fundación formal en el periodo colonial consolidó su posición como centro minero y de paso comercial estratégico en el norte paceño.</p>',
  'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80',
  'conoce/historia-pelechuco.webp',
  'Picos nevados y senderos históricos de Pelechuco',
  1,
  true
),
(
  'cultura',
  'Cultura, Tradición y Textilería',
  'Patrimonio vivo de Apolobamba',
  '<p>Reconocido por la preservación de la textilería tradicional en fibra de alpaca y lana de oveja teñida con tintes vegetales naturales de la región. Las fiestas patronales, la música de instrumentos de viento andinos y la estrecha convivencia con la vicuña silvestre y la alpaca definen la identidad del pueblo pelechuqueño.</p>',
  'https://images.unsplash.com/photo-1531804065854-c7b4f00e6b82?w=800&q=80',
  'conoce/cultura-textil.webp',
  'Artesanía y textilería de alpaca de Pelechuco',
  2,
  true
),
(
  'comunidades',
  'Cantones y Ayllus Originarios',
  'Estructura territorial y comunal',
  '<p>El territorio municipal se organiza en cantones y ayllus originarios: Pelechuco Central, Ulla Ulla, Antaquilla, Hichocollo, Queara, Puina, Suches, Katantika y Agua Blanca. Cada cantón posee vocaciones productivas que combinan ganadería de camélidos, agricultura de alta montaña y minería tradicional cooperativa.</p>',
  'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=800&q=80',
  'conoce/comunidades-ayllus.webp',
  'Comunidad originaria en el altiplano de Franz Tamayo',
  3,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  image_url = EXCLUDED.image_url;

-- 4. GALERÍA DE IMÁGENES
INSERT INTO public.galeria_imagenes (
  title,
  description,
  image_url,
  image_key,
  alt_text,
  category,
  display_order,
  is_active
) VALUES
(
  'Cumbres Nevadas de Apolobamba',
  'Majestuosos nevados que coronan el valle de Pelechuco',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
  'galeria/cumbres-nevadas.webp',
  'Cumbres nevadas de la cordillera de Apolobamba',
  'paisaje',
  1,
  true
),
(
  'Valles y Praderas de Alta Montaña',
  'Ecosistemas de bofedales y pastizales naturales',
  'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80',
  'galeria/valles-alta-montana.webp',
  'Valles verdes de altura en Pelechuco',
  'paisaje',
  2,
  true
),
(
  'Tradición Alpaquera y Camélida',
  'Crianza sustentable de alpacas en el cantón Ulla Ulla',
  'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80',
  'galeria/alpacas-ulla-ulla.webp',
  'Alpacas pastando en bofedales andinos',
  'fauna',
  3,
  true
),
(
  'Caminos y Rutas de Integración',
  'Red vial comunitaria que conecta los ayllus del municipio',
  'https://images.unsplash.com/photo-1531804065854-c7b4f00e6b82?w=800&q=80',
  'galeria/caminos-integracion.webp',
  'Caminos de herradura y carreteras vecinales',
  'obras',
  4,
  true
)
ON CONFLICT DO NOTHING;

-- 5. CATEGORÍAS DE NOTICIAS
INSERT INTO public.noticias_categorias (name, slug, color_hex, display_order, is_active) VALUES
('Institucional', 'institucional', '#1B3A6B', 1, true),
('Obras', 'obras', '#C25E00', 2, true),
('Salud', 'salud', '#0D9488', 3, true),
('Cultura', 'cultura', '#7C3AED', 4, true),
('Educación', 'educacion', '#2563EB', 5, true),
('Medio Ambiente', 'medio-ambiente', '#2D5016', 6, true)
ON CONFLICT (name) DO UPDATE SET color_hex = EXCLUDED.color_hex;

-- 6. NOTICIAS Y COMUNICADOS
INSERT INTO public.noticias (
  title,
  slug,
  summary,
  content,
  featured_image_url,
  featured_image_key,
  featured_image_alt,
  category_id,
  status,
  is_featured,
  published_at
) VALUES
(
  'Rehabilitación y ensanchamiento del tramo vial Pelechuco - Ulla Ulla concluye con éxito',
  'rehabilitacion-vial-pelechuco-ulla-ulla',
  'La Dirección de Obras Públicas finalizó los trabajos de mantenimiento de caminos y drenajes pluviales, garantizando el tránsito seguro de productores y transporte vecinal.',
  '<p>El Gobierno Autónomo Municipal de Pelechuco, mediante la Dirección de Obras Públicas y Maquinaria Pesada, concluyó con éxito las faenas de mantenimiento, perfilado y ensanche de la plataforma vial en el tramo troncal que conecta la capital municipal con el cantón Ulla Ulla.</p><p>Esta ruta estratégica permite el transporte diario de fibra de alpaca, productos agropecuarios y facilita el acceso seguro de las brigadas móviles de salud hacia los ayllus más alejados de la cordillera.</p>',
  'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80',
  'noticias/2026/obras-tramo-ulla-ulla.webp',
  'Maquinaria pesada trabajando en mantenimiento vial de Pelechuco',
  (SELECT id FROM public.noticias_categorias WHERE slug = 'obras' LIMIT 1),
  'publicado',
  true,
  '2026-10-20 09:00:00-04'
),
(
  'Concejo Municipal aprueba Ley de Fomento a la Producción y Transformación de Fibra de Alpaca',
  'ley-fomento-fibra-alpaca',
  'La normativa municipal canaliza asistencia técnica, equipamiento para centros de acopio y capacitación artesanal para más de 40 comunidades alpaqueras.',
  '<p>En sesión ordinaria, el Concejo Municipal de Pelechuco aprobó por unanimidad la Ley Municipal N° 048/2026 orientada a la reactivación productiva camélida. El programa contempla la dotación de esquiladoras mecánicas, asistencia veterinaria y la apertura de mercados justos en coordinación con artesanas de Apolobamba.</p>',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
  'noticias/2026/sesion-concejo-fibra-alpaca.webp',
  'Sesión del Concejo Municipal de Pelechuco',
  (SELECT id FROM public.noticias_categorias WHERE slug = 'institucional' LIMIT 1),
  'publicado',
  true,
  '2026-10-18 11:30:00-04'
),
(
  'Brigadas médicas municipales recorren postas de salud comunales con entrega de insumos',
  'brigadas-medicas-comunales',
  'Personal de la Red de Salud Franz Tamayo brindó atención odontológica, control prenatal, medicina general y vacunación infantil en Puina y Queara.',
  '<p>Con el objetivo de garantizar una atención digna y oportuna, la Dirección de Desarrollo Humano y Salud del municipio desplegó brigadas móviles multidisciplinarias. Se dotaron medicamentos esenciales a los botiquines comunales y se realizaron exámenes preventivos a más de 300 comunarios de sectores de alta montaña.</p>',
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
  'noticias/2026/brigadas-salud-comunales.webp',
  'Personal médico brindando atención primaria en Pelechuco',
  (SELECT id FROM public.noticias_categorias WHERE slug = 'salud' LIMIT 1),
  'publicado',
  false,
  '2026-10-14 14:00:00-04'
),
(
  'Feria Anual de Camélidos y Ecoturismo Apolobamba 2026 reúne a delegaciones del norte paceño',
  'feria-camelidos-apolobamba-2026',
  'Exposición de ejemplares campeones de alpacas Huacaya y Suri, tejidos finos tradicionales y platos típicos andinos en el campo ferial municipal.',
  '<p>Pelechuco vivió tres jornadas de fiesta, cultura y dinamización económica en el marco de su Feria Productiva Anual. Comunidades de Antaquilla, Hichocollo y Suches exhibieron sus mejores piezas de textilería ancestral teñida con tintes naturales de flora andina, atrayendo a visitantes e investigadores de todo el país.</p>',
  'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80',
  'noticias/2026/feria-camelidos-ecoturismo.webp',
  'Feria productiva de camélidos en Pelechuco',
  (SELECT id FROM public.noticias_categorias WHERE slug = 'cultura' LIMIT 1),
  'publicado',
  false,
  '2026-10-08 10:00:00-04'
),
(
  'Entrega de equipamiento tecnológico y mobiliario escolar a unidades educativas rurales',
  'entrega-mobiliario-escolar',
  'Estudiantes de primaria y secundaria de centros educativos del municipio recibieron módulos de computación, bibliotecas escolares y material pedagógico.',
  '<p>El alcalde municipal encabezó el acto oficial de entrega de material educativo y equipamiento informático para cinco unidades educativas. Esta iniciativa busca reducir la brecha digital en el área rural y mejorar las condiciones de aprendizaje de la niñez y juventud pelechuqueña.</p>',
  'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80',
  'noticias/2026/equipamiento-escolar-rural.webp',
  'Estudiantes de Pelechuco con nuevo equipamiento escolar',
  (SELECT id FROM public.noticias_categorias WHERE slug = 'educacion' LIMIT 1),
  'publicado',
  false,
  '2026-09-29 16:00:00-04'
),
(
  'Plan de Reforestación y Protección de Cuencas Hídricas en el Área Natural Apolobamba',
  'reforestacion-cuencas-apolobamba',
  'En alianza con guardaparques y autoridades originarias, se plantaron más de 5.000 queñuas para preservar las nacientes de agua dulce.',
  '<p>La Unidad de Medio Ambiente y Recursos Hídricos lideró una masiva jornada comunitaria de reforestación con especies nativas en las microcuencas que alimentan al río Pelechuco. Esta acción previene la erosión del suelo y salvaguarda las reservas hídricas frente al cambio climático.</p>',
  'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=800&q=80',
  'noticias/2026/reforestacion-queñua-apolobamba.webp',
  'Plantación comunitaria de queñuas en nacientes de agua',
  (SELECT id FROM public.noticias_categorias WHERE slug = 'medio-ambiente' LIMIT 1),
  'publicado',
  false,
  '2026-09-22 08:30:00-04'
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  content = EXCLUDED.content;

-- 7. AUTORIDADES MUNICIPALES
INSERT INTO public.autoridades (
  name,
  position,
  area,
  biography,
  photo_url,
  photo_key,
  institutional_contact,
  display_order,
  is_active
) VALUES
(
  'Lic. Pedro Mamani Huanca',
  'Alcalde Municipal',
  'Despacho del Alcalde',
  'Economista y líder comunitario oriundo de Franz Tamayo. Cuenta con más de 12 años de experiencia en gestión pública andina, ejecución de proyectos viales y fomento a la producción camélida.',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
  'autoridades/alcalde-pedro-mamani.webp',
  'alcaldia@pelechuco.gob.bo · (+591) 715-84210',
  1,
  true
),
(
  'Sra. Martha Condori Ticona',
  'Presidenta del Concejo Municipal',
  'Concejo Municipal',
  'Representante de las organizaciones de mujeres productoras de Ulla Ulla. Ejerce la fiscalización municipal promoviendo normativas de salud comunitaria, educación bilingüe y protección ambiental.',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
  'autoridades/presidenta-concejo-martha-condori.webp',
  'concejo@pelechuco.gob.bo',
  2,
  true
),
(
  'Sr. Juan Carlos Hilari Choque',
  'Concejal Secretario',
  'Concejo Municipal',
  'Docente rural y legislador municipal. Coordina las comisiones de infraestructura, límites intercantonales y preservación del patrimonio histórico de Pelechuco.',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
  'autoridades/concejal-juan-carlos-hilari.webp',
  'jhilari@pelechuco.gob.bo',
  3,
  true
),
(
  'Arq. Marcelo Ramos Flores',
  'Director de Obras Públicas y Catastro',
  'Dirección de Obras Públicas',
  'Especialista en planificación territorial de alta montaña, caminos vecinales y diseño de infraestructura sostenible adaptada al clima andino.',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
  'autoridades/director-obras-marcelo-ramos.webp',
  'obras@pelechuco.gob.bo',
  4,
  true
),
(
  'Dra. Elena Vargas Colque',
  'Directora de Desarrollo Humano y Salud',
  'Desarrollo Humano y Salud',
  'Médico salubrista comprometida con la atención primaria en postas rurales, campañas de nutrición materno-infantil y prevención sanitaria en todo el municipio.',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80',
  'autoridades/directora-salud-elena-vargas.webp',
  'salud@pelechuco.gob.bo',
  5,
  true
),
(
  'Lic. Javier Mendoza Poma',
  'Jefe de Administración y Finanzas (ATM)',
  'Administración Tributaria Municipal',
  'Auditor financiero con amplia experiencia en transparencia presupuestaria, gestión de recursos estatales y modernización de la recaudación tributaria.',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80',
  'autoridades/jefe-atm-javier-mendoza.webp',
  'finanzas@pelechuco.gob.bo',
  6,
  true
)
ON CONFLICT DO NOTHING;

-- 8. CATEGORÍAS DE TRÁMITES (Administrables dinámicamente)
INSERT INTO public.tramites_categorias (name, slug, description, icon, display_order, is_active) VALUES
('Registro Civil', 'registro-civil', 'Certificaciones comunales, actas y personerías originarias', '📜', 1, true),
('Urbanismo', 'urbanismo', 'Catastro, permisos de construcción y zonificación', '🏗️', 2, true),
('Actividad Económica', 'actividad-economica', 'Licencias de funcionamiento, patentes y microempresas', '💼', 3, true),
('Tributos', 'tributos', 'Pago de impuestos sobre bienes inmuebles y automotores', '💰', 4, true)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  icon = EXCLUDED.icon;

-- 9. CATÁLOGO DE TRÁMITES Y SERVICIOS
INSERT INTO public.tramites (
  category_id,
  title,
  slug,
  description,
  requirements,
  office,
  schedule,
  cost,
  processing_time,
  contact_info,
  display_order,
  is_active
) VALUES
(
  (SELECT id FROM public.tramites_categorias WHERE slug = 'urbanismo' LIMIT 1),
  'Certificado de Registro Catastral y Derecho Propietario',
  'certificado-registro-catastral',
  'Emisión de certificación catastral técnica para inmuebles urbanos y predios comunales con delimitación geográfica oficial.',
  '[
    "Fotocopia simple de Cédula de Identidad del propietario vigente",
    "Plano topográfico georreferenciado visado por la Dirección de Catastro",
    "Título ejecutorial o minuta de compraventa debidamente protocolizada",
    "Comprobante de no adeudo tributario municipal del año en curso",
    "Formulario F-CAT-01 de solicitud debidamente llenado"
  ]'::jsonb,
  'Dirección de Catastro y Urbanismo (Planta Baja, Ventanilla 2)',
  'Lunes a Viernes de 08:30 a 14:00',
  'Bs. 50 (según arancel municipal)',
  '3 a 5 días hábiles',
  'catastro@pelechuco.gob.bo · Int. 102',
  1,
  true
),
(
  (SELECT id FROM public.tramites_categorias WHERE slug = 'actividad-economica' LIMIT 1),
  'Licencia de Funcionamiento para Actividades Económicas',
  'licencia-funcionamiento-actividades-economicas',
  'Autorización municipal para la apertura, operación y registro legal de comercios, hospedajes, servicios y microempresas locales.',
  '[
    "Formulario de solicitud F-101 debidamente firmado por el titular",
    "Fotocopia de C.I. del propietario o representante legal",
    "Fotocopia de NIT vigente (cuando corresponda)",
    "Certificado de compatibilidad de uso de suelo y zonificación",
    "Inspección técnica favorable de sanidad y seguridad de la Intendencia"
  ]'::jsonb,
  'Unidad de Recaudaciones y Patentes (Planta Baja, Ventanilla 1)',
  'Lunes a Viernes de 08:30 a 16:00',
  'Bs. 80 (renovación anual según categoría)',
  '48 horas hábiles',
  'patentes@pelechuco.gob.bo · Int. 104',
  2,
  true
),
(
  (SELECT id FROM public.tramites_categorias WHERE slug = 'urbanismo' LIMIT 1),
  'Permiso de Construcción y Refacción de Inmuebles',
  'permiso-construccion-refaccion-inmuebles',
  'Autorización técnica y legal para edificaciones nuevas, ampliaciones o remodelaciones en el radio urbano y comunal.',
  '[
    "Planos arquitectónicos y de elevación firmados por profesional habilitado",
    "Certificado catastral actualizado otorgado por el GAM Pelechuco",
    "Fotocopia de C.I. del solicitante y título de propiedad del predio",
    "Boleta de depósito bancario de arancel de revisión de obras"
  ]'::jsonb,
  'Dirección de Obras Públicas (Primer Piso, Of. 104)',
  'Lunes a Viernes de 09:00 a 15:30',
  'Según superficie construida (Bs. 1.50 por m²)',
  '5 días hábiles',
  'obras@pelechuco.gob.bo · Int. 105',
  3,
  true
),
(
  (SELECT id FROM public.tramites_categorias WHERE slug = 'registro-civil' LIMIT 1),
  'Certificación de Límites y Jurisdicción Comunal',
  'certificacion-limites-jurisdiccion-comunal',
  'Documento oficial que acredita la pertenencia comunal, límites ancestrales de ayllus y personería de organizaciones sociales.',
  '[
    "Nota formal de solicitud suscrita por autoridades originarias de la comunidad",
    "Acta de posesión comunal y personería jurídica de la central agraria",
    "Croquis referencial de colindancias y mojones tradicionales"
  ]'::jsonb,
  'Secretaría General y Relacionamiento Comunitario (Piso 2)',
  'Lunes a Viernes de 08:30 a 16:30',
  'Trámite Gratuito',
  '24 a 48 horas',
  'secretaria@pelechuco.gob.bo · Int. 101',
  4,
  true
),
(
  (SELECT id FROM public.tramites_categorias WHERE slug = 'tributos' LIMIT 1),
  'Pago de Impuesto a la Propiedad de Bienes Inmuebles y Vehículos',
  'pago-impuesto-propiedad-inmuebles-vehiculos',
  'Liquidación y cobro de impuestos municipales anuales con descuentos de hasta el 15% por pronto pago.',
  '[
    "Número de padrón tributario municipal o comprobante de pago anterior",
    "Fotocopia de Cédula de Identidad del titular o apoderado legal",
    "RUAT vehicular en caso de automotores y motocicletas"
  ]'::jsonb,
  'Administración Tributaria Municipal (ATM Pelechuco)',
  'Lunes a Viernes de 08:30 a 16:30',
  'Según avalúo fiscal y escala impositiva vigente',
  'Inmediato en ventanilla o banca autorizada',
  'tributos@pelechuco.gob.bo · Int. 103',
  5,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  requirements = EXCLUDED.requirements;

-- 10. CONFIGURACIÓN INSTITUCIONAL Y CONTACTO
INSERT INTO public.contacto_config (
  id,
  institution_name,
  institution_short_name,
  motto,
  address_primary,
  address_secondary,
  city_department,
  phone_central,
  phone_whatsapp,
  emergency_line,
  email_general,
  email_dispatch,
  schedule_weekdays,
  map_latitude,
  map_longitude,
  map_embed_url
) VALUES (
  1,
  'Gobierno Autónomo Municipal de Pelechuco',
  'GAM Pelechuco',
  'Tierra de Montañas, Raíces Vivas y Progreso Comunitario',
  'Plaza Principal 25 de Mayo s/n · Acera Norte',
  'Edificio Consistorial Municipal',
  'Pelechuco, Provincia Franz Tamayo, Departamento de La Paz, Estado Plurinacional de Bolivia',
  '(+591) 2 214-5890',
  '(+591) 715-84210',
  'Línea 114 Pelechuco (Atención 24 Horas)',
  'contacto@pelechuco.gob.bo',
  'alcaldia@pelechuco.gob.bo',
  'Lunes a Viernes de 08:30 a 16:30 (Horario continuo)',
  -14.816667,
  -69.050000,
  'https://maps.google.com/maps?q=-14.816667,-69.050000&hl=es&z=14&output=embed'
) ON CONFLICT (id) DO UPDATE SET
  address_primary = EXCLUDED.address_primary,
  phone_central = EXCLUDED.phone_central,
  phone_whatsapp = EXCLUDED.phone_whatsapp,
  email_general = EXCLUDED.email_general,
  schedule_weekdays = EXCLUDED.schedule_weekdays;

-- 11. REDES SOCIALES OFICIALES
INSERT INTO public.redes_sociales (
  platform,
  name,
  url,
  handle,
  icon_name,
  display_order,
  is_active
) VALUES
(
  'facebook',
  'Facebook Oficial',
  'https://facebook.com/GAMPelechuco',
  '@GAMPelechuco',
  'facebook',
  1,
  true
),
(
  'whatsapp',
  'WhatsApp Vecinal y Emergencias',
  'https://wa.me/59171584210',
  '+591 715-84210',
  'whatsapp',
  2,
  true
),
(
  'youtube',
  'YouTube — Sesiones en Vivo del Concejo',
  'https://youtube.com/@GAMPelechuco',
  'GAM Pelechuco Oficial',
  'youtube',
  3,
  true
),
(
  'tiktok',
  'TikTok — Turismo y Cultura Pelechuco',
  'https://tiktok.com/@pelechuco.turismo',
  '@pelechuco.turismo',
  'tiktok',
  4,
  true
),
(
  'twitter_x',
  'X (Twitter) — Alertas y Avisos Municipales',
  'https://twitter.com/GAMPelechuco',
  '@GAMPelechuco',
  'twitter_x',
  5,
  true
)
ON CONFLICT DO NOTHING;
