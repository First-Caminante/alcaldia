-- ==============================================================================
-- GOBIERNO AUTÓNOMO MUNICIPAL DE PELECHUCO — BASE DE DATOS SUPABASE / POSTGRESQL
-- Arquitectura: Astro (Frontend) + Hono (API) + Supabase (PostgreSQL) + Cloudflare R2
-- ==============================================================================

-- 1. EXTENSIONES REQUERIDAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- 2. FUNCIÓN DE ACTUALIZACIÓN AUTOMÁTICA DE TIMESTAMP
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 3. TABLA: ADMINISTRADORES (admin_users)
-- ==============================================================================
-- Nota: Vinculado a auth.users de Supabase. Único rol: Administrador con acceso total.
CREATE TABLE public.admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT, -- Cloudflare R2
  phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_admin_users_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Función de seguridad para comprobar si el usuario actual es administrador
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE id = auth.uid() AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para registrar automáticamente en admin_users al crear usuario en auth.users
CREATE OR REPLACE FUNCTION public.handle_new_admin_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.admin_users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = EXCLUDED.full_name;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_admin_user();

-- ==============================================================================
-- 4. TABLA: GESTIÓN DE ARCHIVOS / MEDIA EN CLOUDFLARE R2 (r2_media)
-- ==============================================================================
-- Centraliza todas las imágenes y PDFs subidos a Cloudflare R2
CREATE TABLE public.r2_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_key TEXT UNIQUE NOT NULL,          -- Ej: 'noticias/2026/tramo-ulla-ulla.webp'
  public_url TEXT NOT NULL,                -- URL pública o CDN en Cloudflare R2
  bucket_name TEXT NOT NULL DEFAULT 'pelechuco-media',
  file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL DEFAULT 0,
  folder TEXT NOT NULL DEFAULT 'general' CHECK (folder IN ('hero', 'conoce', 'galeria', 'noticias', 'autoridades', 'tramites', 'general')),
  uploaded_by UUID REFERENCES public.admin_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_r2_media_folder ON public.r2_media(folder);
CREATE INDEX idx_r2_media_created ON public.r2_media(created_at DESC);

-- ==============================================================================
-- 5. TABLA: SECCIÓN HERO / PORTADA (hero_section)
-- ==============================================================================
CREATE TABLE public.hero_section (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1), -- Fila única configurable
  badge_text TEXT NOT NULL DEFAULT 'Gobierno Autónomo Municipal · La Paz, Bolivia',
  title_main TEXT NOT NULL DEFAULT 'Tierra de montañas',
  title_highlight TEXT NOT NULL DEFAULT 'y comunidades',
  subtitle TEXT NOT NULL DEFAULT 'Pelechuco, municipio de la provincia Franz Tamayo, departamento de La Paz, Bolivia.',
  bg_image_url TEXT NOT NULL,             -- URL Cloudflare R2
  bg_image_key TEXT,                     -- Key Cloudflare R2
  cta_primary_text TEXT NOT NULL DEFAULT 'Explorar el municipio',
  cta_primary_link TEXT NOT NULL DEFAULT '#conoce',
  cta_secondary_text TEXT NOT NULL DEFAULT 'Ver comunicados',
  cta_secondary_link TEXT NOT NULL DEFAULT '#noticias',
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_hero_section_updated_at
  BEFORE UPDATE ON public.hero_section
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 6. TABLA: CONOCE PELECHUCO — INTRODUCCIÓN GENERAL (conoce_intro)
-- ==============================================================================
CREATE TABLE public.conoce_intro (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1), -- Fila única
  title TEXT NOT NULL DEFAULT 'Territorio andino y corazón de Apolobamba',
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,                 -- URL Cloudflare R2
  image_key TEXT,
  altitud TEXT NOT NULL DEFAULT '3.600 m s. n. m.',
  superficie TEXT NOT NULL DEFAULT '2.714 km²',
  poblacion TEXT NOT NULL DEFAULT '6.850 habitantes',
  cantones_texto TEXT NOT NULL DEFAULT '9 Cantones y Ayllus Originarios',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_conoce_intro_updated_at
  BEFORE UPDATE ON public.conoce_intro
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 7. TABLA: CONOCE PELECHUCO — SECCIONES TEMÁTICAS (conoce_secciones)
-- ==============================================================================
-- Para: Historia, Cultura & Tradición, Comunidades & Cantones (y nuevas a futuro)
CREATE TABLE public.conoce_secciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,               -- 'historia', 'cultura', 'comunidades'
  title TEXT NOT NULL,
  subtitle TEXT,
  content TEXT NOT NULL,                   -- Contenido en formato HTML / Markdown
  image_url TEXT,                          -- URL Cloudflare R2
  image_key TEXT,                          -- Key Cloudflare R2
  image_alt TEXT,
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_conoce_secciones_order ON public.conoce_secciones(display_order);

CREATE TRIGGER trg_conoce_secciones_updated_at
  BEFORE UPDATE ON public.conoce_secciones
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 8. TABLA: GALERÍA DE IMÁGENES (galeria_imagenes)
-- ==============================================================================
CREATE TABLE public.galeria_imagenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,                 -- URL Cloudflare R2
  image_key TEXT,                          -- Key Cloudflare R2
  alt_text TEXT,
  category TEXT NOT NULL DEFAULT 'paisaje',
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_galeria_order ON public.galeria_imagenes(display_order);
CREATE INDEX idx_galeria_active ON public.galeria_imagenes(is_active);

CREATE TRIGGER trg_galeria_imagenes_updated_at
  BEFORE UPDATE ON public.galeria_imagenes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 9. TABLAS: NOTICIAS Y COMUNICADOS
-- ==============================================================================
CREATE TABLE public.noticias_categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,               -- 'Obras', 'Institucional', 'Salud', etc.
  slug TEXT UNIQUE NOT NULL,
  color_hex TEXT NOT NULL DEFAULT '#2D5016',
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_noticias_cat_slug ON public.noticias_categorias(slug);

CREATE TABLE public.noticias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  summary TEXT NOT NULL,
  content TEXT NOT NULL,                   -- Contenido completo
  featured_image_url TEXT NOT NULL,        -- URL Cloudflare R2
  featured_image_key TEXT,                 -- Key Cloudflare R2
  featured_image_alt TEXT,
  category_id UUID REFERENCES public.noticias_categorias(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'publicado' CHECK (status IN ('borrador', 'publicado', 'archivado')),
  is_featured BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  views_count INT NOT NULL DEFAULT 0,
  created_by UUID REFERENCES public.admin_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_noticias_slug ON public.noticias(slug);
CREATE INDEX idx_noticias_published ON public.noticias(published_at DESC) WHERE status = 'publicado';
CREATE INDEX idx_noticias_category ON public.noticias(category_id);

CREATE TRIGGER trg_noticias_updated_at
  BEFORE UPDATE ON public.noticias
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Archivos adjuntos a noticias (Boletines PDF, Convocatorias, Resoluciones)
CREATE TABLE public.noticias_adjuntos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  noticia_id UUID NOT NULL REFERENCES public.noticias(id) ON DELETE CASCADE,
  file_title TEXT NOT NULL,
  file_url TEXT NOT NULL,                  -- URL Cloudflare R2
  file_key TEXT NOT NULL,                  -- Key Cloudflare R2
  file_name TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL DEFAULT 0,
  mime_type TEXT NOT NULL DEFAULT 'application/pdf',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_noticias_adjuntos_noticia ON public.noticias_adjuntos(noticia_id);

-- ==============================================================================
-- 10. TABLA: AUTORIDADES MUNICIPALES (autoridades)
-- ==============================================================================
CREATE TABLE public.autoridades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                      -- 'Lic. Pedro Mamani Huanca'
  position TEXT NOT NULL,                  -- 'Alcalde Municipal'
  area TEXT NOT NULL,                      -- 'Despacho del Alcalde'
  biography TEXT,                          -- Semblanza biográfica
  photo_url TEXT,                          -- Foto en Cloudflare R2
  photo_key TEXT,
  institutional_contact TEXT,              -- 'alcaldia@pelechuco.gob.bo · (+591) 715-84210'
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_autoridades_order ON public.autoridades(display_order);
CREATE INDEX idx_autoridades_active ON public.autoridades(is_active);

CREATE TRIGGER trg_autoridades_updated_at
  BEFORE UPDATE ON public.autoridades
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 11. TABLAS: TRÁMITES Y SERVICIOS CIUDADANOS
-- ==============================================================================
-- Categorías dinámicas administrables (pueden crearse/editarse desde el admin)
CREATE TABLE public.tramites_categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,               -- 'Registro Civil', 'Urbanismo', etc.
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT NOT NULL DEFAULT '📋',
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tramites_cat_order ON public.tramites_categorias(display_order);

CREATE TRIGGER trg_tramites_categorias_updated_at
  BEFORE UPDATE ON public.tramites_categorias
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TABLE public.tramites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.tramites_categorias(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  requirements JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array de requisitos en texto
  office TEXT NOT NULL,                    -- 'Dirección de Catastro (Ventanilla 2)'
  schedule TEXT NOT NULL DEFAULT 'Lunes a Viernes de 08:30 a 16:30',
  cost TEXT NOT NULL DEFAULT 'Trámite Gratuito',
  processing_time TEXT NOT NULL DEFAULT '24 a 48 horas',
  contact_info TEXT,                       -- Correo o interno
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tramites_category ON public.tramites(category_id);
CREATE INDEX idx_tramites_slug ON public.tramites(slug);
CREATE INDEX idx_tramites_order ON public.tramites(display_order);

CREATE TRIGGER trg_tramites_updated_at
  BEFORE UPDATE ON public.tramites
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Formularios y Requisitos descargables en PDF (Cloudflare R2)
CREATE TABLE public.tramites_archivos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tramite_id UUID NOT NULL REFERENCES public.tramites(id) ON DELETE CASCADE,
  file_title TEXT NOT NULL,                -- 'Formulario F-CAT-01 de Solicitud'
  file_url TEXT NOT NULL,                  -- URL Cloudflare R2
  file_key TEXT NOT NULL,                  -- Key Cloudflare R2
  file_name TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL DEFAULT 0,
  mime_type TEXT NOT NULL DEFAULT 'application/pdf',
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tramites_archivos_tramite ON public.tramites_archivos(tramite_id);

-- ==============================================================================
-- 12. TABLA: CONFIGURACIÓN INSTITUCIONAL Y CONTACTO (contacto_config)
-- ==============================================================================
CREATE TABLE public.contacto_config (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1), -- Fila única
  institution_name TEXT NOT NULL DEFAULT 'Gobierno Autónomo Municipal de Pelechuco',
  institution_short_name TEXT NOT NULL DEFAULT 'GAM Pelechuco',
  motto TEXT NOT NULL DEFAULT 'Tierra de Montañas, Raíces Vivas y Progreso Comunitario',
  address_primary TEXT NOT NULL DEFAULT 'Plaza Principal 25 de Mayo s/n · Acera Norte',
  address_secondary TEXT DEFAULT 'Edificio Consistorial Municipal',
  city_department TEXT NOT NULL DEFAULT 'Pelechuco, Provincia Franz Tamayo, Departamento de La Paz, Bolivia',
  phone_central TEXT NOT NULL DEFAULT '(+591) 2 214-5890',
  phone_whatsapp TEXT NOT NULL DEFAULT '(+591) 715-84210',
  emergency_line TEXT NOT NULL DEFAULT 'Línea 114 Pelechuco (Atención 24 Horas)',
  email_general TEXT NOT NULL DEFAULT 'contacto@pelechuco.gob.bo',
  email_dispatch TEXT NOT NULL DEFAULT 'alcaldia@pelechuco.gob.bo',
  schedule_weekdays TEXT NOT NULL DEFAULT 'Lunes a Viernes de 08:30 a 16:30 (Horario continuo)',
  map_latitude NUMERIC(10, 7) NOT NULL DEFAULT -14.816667,
  map_longitude NUMERIC(10, 7) NOT NULL DEFAULT -69.050000,
  map_embed_url TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_contacto_config_updated_at
  BEFORE UPDATE ON public.contacto_config
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 13. TABLA: REDES SOCIALES OFICIALES (redes_sociales)
-- ==============================================================================
CREATE TABLE public.redes_sociales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,                  -- 'facebook', 'whatsapp', 'youtube', 'tiktok', 'twitter_x'
  name TEXT NOT NULL,                      -- 'Facebook Oficial', 'WhatsApp Vecinal'
  url TEXT NOT NULL,
  handle TEXT,                             -- '@GAMPelechuco'
  icon_name TEXT NOT NULL DEFAULT 'facebook',
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_redes_order ON public.redes_sociales(display_order);
CREATE INDEX idx_redes_active ON public.redes_sociales(is_active);

CREATE TRIGGER trg_redes_sociales_updated_at
  BEFORE UPDATE ON public.redes_sociales
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 14. TABLA: MENSAJES Y BUZÓN DE CONTACTO CIUDADANO (mensajes_contacto)
-- ==============================================================================
CREATE TABLE public.mensajes_contacto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mensajes_created ON public.mensajes_contacto(created_at DESC);
CREATE INDEX idx_mensajes_read ON public.mensajes_contacto(is_read);

-- ==============================================================================
-- 15. POLÍTICAS DE SEGURIDAD ROW LEVEL SECURITY (RLS)
-- ==============================================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.r2_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_section ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conoce_intro ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conoce_secciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.galeria_imagenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.noticias_categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.noticias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.noticias_adjuntos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.autoridades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tramites_categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tramites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tramites_archivos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacto_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redes_sociales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensajes_contacto ENABLE ROW LEVEL SECURITY;

-- ── 15.1 POLÍTICAS PÚBLICAS (Lectura anónima para portal Astro / visitantes) ──
CREATE POLICY "Public read hero" ON public.hero_section
  FOR SELECT TO anon, authenticated USING (is_active = true);

CREATE POLICY "Public read conoce intro" ON public.conoce_intro
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Public read conoce secciones" ON public.conoce_secciones
  FOR SELECT TO anon, authenticated USING (is_active = true);

CREATE POLICY "Public read galeria" ON public.galeria_imagenes
  FOR SELECT TO anon, authenticated USING (is_active = true);

CREATE POLICY "Public read noticias categorias" ON public.noticias_categorias
  FOR SELECT TO anon, authenticated USING (is_active = true);

CREATE POLICY "Public read noticias" ON public.noticias
  FOR SELECT TO anon, authenticated USING (status = 'publicado');

CREATE POLICY "Public read noticias adjuntos" ON public.noticias_adjuntos
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Public read autoridades" ON public.autoridades
  FOR SELECT TO anon, authenticated USING (is_active = true);

CREATE POLICY "Public read tramites categorias" ON public.tramites_categorias
  FOR SELECT TO anon, authenticated USING (is_active = true);

CREATE POLICY "Public read tramites" ON public.tramites
  FOR SELECT TO anon, authenticated USING (is_active = true);

CREATE POLICY "Public read tramites archivos" ON public.tramites_archivos
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Public read contacto" ON public.contacto_config
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Public read redes sociales" ON public.redes_sociales
  FOR SELECT TO anon, authenticated USING (is_active = true);

-- Inserción pública del formulario de contacto
CREATE POLICY "Public insert contacto" ON public.mensajes_contacto
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- ── 15.2 POLÍTICAS DE ADMINISTRADOR (Acceso total para administradores validados) ──
-- Control total para admin_users
CREATE POLICY "Admin manage admin_users" ON public.admin_users
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admin manage r2_media" ON public.r2_media
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admin manage hero" ON public.hero_section
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admin manage conoce intro" ON public.conoce_intro
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admin manage conoce secciones" ON public.conoce_secciones
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admin manage galeria" ON public.galeria_imagenes
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admin manage noticias categorias" ON public.noticias_categorias
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admin manage noticias" ON public.noticias
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admin manage noticias adjuntos" ON public.noticias_adjuntos
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admin manage autoridades" ON public.autoridades
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admin manage tramites categorias" ON public.tramites_categorias
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admin manage tramites" ON public.tramites
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admin manage tramites archivos" ON public.tramites_archivos
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admin manage contacto" ON public.contacto_config
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admin manage redes sociales" ON public.redes_sociales
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admin manage mensajes" ON public.mensajes_contacto
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ==============================================================================
-- 16. VISTA AGREGADA PARA ASTRO (Carga ultra-rápida en Cloudflare / SSG / SSR)
-- ==============================================================================
CREATE OR REPLACE VIEW public.v_portal_publico AS
SELECT
  (SELECT row_to_json(h) FROM (SELECT * FROM public.hero_section WHERE is_active = true) h) AS hero,
  (SELECT row_to_json(ci) FROM (SELECT * FROM public.conoce_intro) ci) AS conoce_intro,
  (SELECT json_agg(cs ORDER BY cs.display_order) FROM public.conoce_secciones cs WHERE cs.is_active = true) AS conoce_secciones,
  (SELECT json_agg(gi ORDER BY gi.display_order) FROM public.galeria_imagenes gi WHERE gi.is_active = true) AS galeria,
  (SELECT json_agg(aut ORDER BY aut.display_order) FROM public.autoridades aut WHERE aut.is_active = true) AS autoridades,
  (SELECT json_agg(tc ORDER BY tc.display_order) FROM public.tramites_categorias tc WHERE tc.is_active = true) AS tramites_categorias,
  (SELECT row_to_json(cfg) FROM (SELECT * FROM public.contacto_config) cfg) AS contacto,
  (SELECT json_agg(rs ORDER BY rs.display_order) FROM public.redes_sociales rs WHERE rs.is_active = true) AS redes_sociales;

COMMENT ON VIEW public.v_portal_publico IS 'Vista optimizada en JSON para renderizado instantáneo en Astro y Cloudflare Workers';
