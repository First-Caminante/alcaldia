// Tipos TypeScript para el esquema de Supabase / PostgreSQL de GAM Pelechuco

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string | null;
  phone?: string | null;
  is_active: boolean;
  last_login_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface R2Media {
  id: string;
  file_key: string;
  public_url: string;
  bucket_name: string;
  file_name: string;
  mime_type: string;
  file_size_bytes: number;
  folder: 'hero' | 'conoce' | 'galeria' | 'noticias' | 'autoridades' | 'tramites' | 'general';
  uploaded_by?: string | null;
  created_at: string;
}

export interface HeroSection {
  id: number;
  badge_text: string;
  title_main: string;
  title_highlight: string;
  subtitle: string;
  bg_image_url: string;
  bg_image_key?: string | null;
  cta_primary_text: string;
  cta_primary_link: string;
  cta_secondary_text: string;
  cta_secondary_link: string;
  is_active: boolean;
  updated_at: string;
}

export interface ConoceIntro {
  id: number;
  title: string;
  description: string;
  image_url: string;
  image_key?: string | null;
  altitud: string;
  superficie: string;
  poblacion: string;
  cantones_texto: string;
  updated_at: string;
}

export interface ConoceSeccion {
  id: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  content: string;
  image_url?: string | null;
  image_key?: string | null;
  image_alt?: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GaleriaImagen {
  id: string;
  title: string;
  description?: string | null;
  image_url: string;
  image_key?: string | null;
  alt_text?: string | null;
  category: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface NoticiaCategoria {
  id: string;
  name: string;
  slug: string;
  color_hex: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Noticia {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  featured_image_url: string;
  featured_image_key?: string | null;
  featured_image_alt?: string | null;
  category_id?: string | null;
  status: 'borrador' | 'publicado' | 'archivado';
  is_featured: boolean;
  published_at: string;
  views_count: number;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  category?: NoticiaCategoria;
  adjuntos?: NoticiaAdjunto[];
  video_url?: string | null;
  gallery_images?: string[] | null;
}

export interface NoticiaAdjunto {
  id: string;
  noticia_id: string;
  file_title: string;
  file_url: string;
  file_key: string;
  file_name: string;
  file_size_bytes: number;
  mime_type: string;
  created_at: string;
}

export interface Autoridad {
  id: string;
  name: string;
  position: string;
  area: string;
  biography?: string | null;
  photo_url?: string | null;
  photo_key?: string | null;
  institutional_contact?: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TramiteCategoria {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  tramites?: Tramite[];
}

export interface TramiteRequisito {
  texto: string;
  detalle?: string;
}

export interface Tramite {
  id: string;
  category_id: string;
  title: string;
  slug: string;
  description: string;
  requirements: TramiteRequisito[] | string[];
  office: string;
  schedule: string;
  cost: string;
  processing_time: string;
  contact_info?: string | null;
  image_url?: string | null;
  image_key?: string | null;
  video_url?: string | null;
  document_url?: string | null;
  document_name?: string | null;
  document_key?: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  categoria?: TramiteCategoria;
  archivos?: TramiteArchivo[];
}

export interface TramiteArchivo {
  id: string;
  tramite_id: string;
  file_title: string;
  file_url: string;
  file_key: string;
  file_name: string;
  file_size_bytes: number;
  mime_type: string;
  display_order: number;
  created_at: string;
}

export interface ContactoConfig {
  id: number;
  institution_name: string;
  institution_short_name: string;
  motto: string;
  address_primary: string;
  address_secondary?: string | null;
  city_department: string;
  phone_central: string;
  phone_whatsapp: string;
  emergency_line: string;
  email_general: string;
  email_dispatch: string;
  schedule_weekdays: string;
  map_latitude: number;
  map_longitude: number;
  map_embed_url?: string | null;
  updated_at: string;
}

export interface RedSocial {
  id: string;
  platform: string;
  name: string;
  url: string;
  handle?: string | null;
  icon_name: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MensajeContacto {
  id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
  is_read: boolean;
  read_at?: string | null;
  created_at: string;
}

export interface PortalPublicoView {
  hero: HeroSection;
  conoce_intro: ConoceIntro;
  conoce_secciones: ConoceSeccion[];
  galeria: GaleriaImagen[];
  autoridades: Autoridad[];
  tramites_categorias: (TramiteCategoria & { tramites?: Tramite[] })[];
  contacto: ContactoConfig;
  redes_sociales: RedSocial[];
}
