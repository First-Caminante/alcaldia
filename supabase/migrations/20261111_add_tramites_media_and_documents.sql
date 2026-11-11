-- Migración: Campos multimedia y documento descargable para la tabla public.tramites
-- Fecha: 2026-11-11
-- Descripción: Permite asociar de manera opcional una imagen ilustrativa, un video tutorial de YouTube
--              y un documento descargable oficial (PDF o Word) a cualquier trámite municipal.

ALTER TABLE public.tramites
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS image_key TEXT,
  ADD COLUMN IF NOT EXISTS video_url TEXT,
  ADD COLUMN IF NOT EXISTS document_url TEXT,
  ADD COLUMN IF NOT EXISTS document_name TEXT,
  ADD COLUMN IF NOT EXISTS document_key TEXT;

COMMENT ON COLUMN public.tramites.image_url IS 'URL de la fotografía o imagen ilustrativa del trámite (opcional)';
COMMENT ON COLUMN public.tramites.video_url IS 'Enlace de video de YouTube con guía explicativa del trámite (opcional)';
COMMENT ON COLUMN public.tramites.document_url IS 'URL del documento oficial descargable en formato PDF o Word (opcional)';
COMMENT ON COLUMN public.tramites.document_name IS 'Nombre visible del documento descargable (ej. Formulario_Solicitud.docx) (opcional)';
