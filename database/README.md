# Arquitectura de Base de Datos — GAM Pelechuco
**PostgreSQL en Supabase + Cloudflare R2 + API Hono + Frontend Astro**

---

## 1. Visión General de la Infraestructura

```
┌─────────────────────────────────────────────────────────────┐
│                   CLOUDFLARE PAGES / WORKERS                │
│                                                             │
│   ┌─────────────────────┐         ┌─────────────────────┐   │
│   │    Astro Frontend   │ ◄─────► │      Hono API       │   │
│   │ (Portal Ciudadano   │         │  (Servicios CRUD y  │   │
│   │   + Panel Admin)    │         │   Uploads a R2)     │   │
│   └──────────┬──────────┘         └──────────┬──────────┘   │
└──────────────┼───────────────────────────────┼──────────────┘
               │                               │
               ▼                               ▼
┌─────────────────────────────┐ ┌─────────────────────────────┐
│     SUPABASE (POSTGRES)     │ │        CLOUDFLARE R2        │
│                             │ │  (Almacenamiento Gratuito)  │
│  • Configuración Hero       │ │                             │
│  • Conoce Pelechuco         │ │  • Fotos de Portada / Hero  │
│  • Galería de Imágenes      │ │  • Imágenes de Conoce       │
│  • Noticias y Comunicados   │ │  • Galería de Fotos         │
│  • Autoridades Municipales  │ │  • Fotos de Autoridades     │
│  • Trámites y Categorías    │ │  • PDFs de Formularios      │
│  • Contacto y Redes         │ │  • Adjuntos de Noticias     │
│  • Usuarios Administradores │ │                             │
└─────────────────────────────┘ └─────────────────────────────┘
```

---

## 2. Estructura de Tablas y Mapeo de Archivos R2

| Tabla | Propósito | Campos Clave / Archivos en Cloudflare R2 |
|---|---|---|
| `admin_users` | Cuentas de administradores (único rol) | `id` (FK `auth.users`), `email`, `full_name`, `avatar_url` (R2) |
| `hero_section` | Portada principal (títulos, subtítulos, botones) | `title_main`, `title_highlight`, `bg_image_url` (R2), `bg_image_key` (R2) |
| `conoce_intro` | Datos introductorios y estadísticas | `title`, `description`, `altitud`, `superficie`, `image_url` (R2) |
| `conoce_secciones` | Historia, Cultura y Comunidades | `slug`, `title`, `content` (HTML/Markdown), `image_url` (R2) |
| `galeria_imagenes` | Fotos del municipio y atractivos | `title`, `category`, `image_url` (R2), `display_order` |
| `noticias_categorias`| Categorías de noticias (Obras, Salud, etc.) | `name`, `slug`, `color_hex`, `is_active` |
| `noticias` | Publicaciones y comunicados oficiales | `title`, `slug`, `summary`, `content`, `featured_image_url` (R2) |
| `noticias_adjuntos` | Documentos, decretos y gacetas PDF | `file_title`, `file_url` (R2), `file_size_bytes` |
| `autoridades` | Alcalde, Concejales y Directores | `name`, `position`, `area`, `photo_url` (R2), `contact` |
| `tramites_categorias`| Categorías administrables de trámites | `name`, `slug`, `description`, `icon` (Emoji/SVG) |
| `tramites` | Catálogo de trámites y requisitos | `title`, `slug`, `category_id`, `requirements` (JSONB), `cost`, `plazo` |
| `tramites_archivos` | Formularios y requisitos descargables | `file_title`, `file_url` (PDF en R2), `mime_type` |
| `contacto_config` | Dirección, teléfonos, WhatsApp, horarios, mapa | `phone_central`, `phone_whatsapp`, `email_general`, `map_latitude`, `map_longitude` |
| `redes_sociales` | Links a redes sociales en footer | `platform`, `name`, `url`, `handle`, `is_active`, `display_order` |
| `r2_media` | Catálogo centralizado de archivos en R2 | `file_key`, `public_url`, `file_name`, `mime_type`, `folder` |
| `mensajes_contacto` | Buzón de mensajes enviados por ciudadanos | `full_name`, `email`, `subject`, `message`, `is_read` |

---

## 3. Política de Autenticación y Administradores

* **Sin Roles Complejos**: Siguiendo tu requerimiento, el sistema maneja exclusivamente el rol de **Administrador**.
* **Gestión de Administradores**:
  - Los administradores se autentican a través de **Supabase Auth** (`auth.users`).
  - La tabla `public.admin_users` mantiene sincronizados los datos de perfil y el estado activo (`is_active`).
  - Cualquier administrador autenticado puede crear nuevos administradores o darlos de baja (borrar o inactivar).
* **Seguridad RLS (Row Level Security)**:
  - Todo el contenido público (`hero`, `noticias`, `tramites`, `autoridades`, etc.) tiene permisos `SELECT` públicos para `anon` y `authenticated`.
  - Las operaciones de modificación (`INSERT`, `UPDATE`, `DELETE`) están estrictamente blindadas bajo la función `is_admin()`, que verifica si el `auth.uid()` actual existe y está activo en `admin_users`.

---

## 4. Integración con Cloudflare R2

En el plan gratuito de Cloudflare R2 obtienes:
* **10 GB de almacenamiento gratuito por mes**.
* **10 millones de lecturas de Clase B gratuitas por mes**.
* **1 millón de escrituras de Clase A gratuitas por mes**.
* **Sin cargos por ancho de banda saliente (Egress 100% gratuito)**.

### Estructura de carpetas en el bucket R2 (`pelechuco-media`):
```
pelechuco-media/
├── hero/                ← Imágenes panorámicas de portada
├── conoce/              ← Fotos de historia, cultura y cantones
├── galeria/             ← Galería fotográfica municipal
├── noticias/            ← Imágenes destacadas y comunicados
│   └── docs/            ← PDFs y resoluciones adjuntas
├── autoridades/         ← Retratos de autoridades
└── tramites/            ← Formularios oficiales en PDF
```

---

## 5. Instrucciones de Despliegue en Supabase

1. Abre tu proyecto en el panel de **[Supabase](https://supabase.com)**.
2. Ve al menú lateral izquierdo y haz clic en **SQL Editor**.
3. Abre el archivo [`database/schema.sql`](file:///home/caminante/projectspersonales/alcaldia/database/schema.sql), copia su contenido y pégalo en el SQL Editor.
4. Presiona **RUN** para crear todas las tablas, índices, triggers y políticas RLS.
5. Luego abre el archivo [`database/seed.sql`](file:///home/caminante/projectspersonales/alcaldia/database/seed.sql), copia su contenido y presiona **RUN** para poblar la base de datos con los datos reales de Pelechuco.
