-- Migración: Soporte para Video de YouTube y Galería de Fotos Adicionales en Noticias
-- GAM Pelechuco

ALTER TABLE public.noticias 
  ADD COLUMN IF NOT EXISTS video_url TEXT,
  ADD COLUMN IF NOT EXISTS gallery_images JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.noticias.video_url IS 'Enlace oficial de YouTube del comunicado o noticia';
COMMENT ON COLUMN public.noticias.gallery_images IS 'Array JSON con URLs de fotos adicionales para el carrusel de la tarjeta y la noticia completa';
