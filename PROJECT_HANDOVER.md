# MASTER BLUEPRINT & HANDOVER — PELECHUCO DIGITAL
**Gobierno Autónomo Municipal de Pelechuco (La Paz, Bolivia)**
*Documento de especificación técnica y directrices de implementación full-stack*

---

## 1. Resumen Ejecutivo y Estado Actual

- **Cliente**: Gobierno Autónomo Municipal de Pelechuco (Provincia Franz Tamayo, La Paz, Bolivia).
- **Diseño Oficial Aprobado**: **Propuesta 02 — Territorio y Naturaleza** (Verde bosque `#2D5016`, acento piedra `#C4A882`, fondo tenue piedra cálida `#E4DAC3` / `#D5C9AE`, tarjetas marfil `#F4EFE2`, tipografía *Playfair Display* + *Lato*).
- **Elementos Excluidos (Eliminados expresamente)**:
  - ❌ **Sin Organigrama**: Se retiró el árbol jerárquico de autoridades.
  - ❌ **Sin Franja Destacada de Redes Sociales**: Se eliminó el banner verde superior del footer. Los enlaces a redes sociales van exclusivamente como iconos institucionales en la Columna 1 y barra inferior del Footer.
  - ❌ **Sin Selector de Propuestas**: Todas las demás 7 propuestas fueron eliminadas. Queda únicamente este portal oficial.

---

## 2. Stack Tecnológico Definido

```
┌──────────────────────────────────────────────────────────────────┐
│                   CLOUDFLARE (PLAN GRATUITO)                     │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                    Astro 4+ / 5+ (Frontend)                │  │
│  │     • Renderizado híbrido (SSG para velocidad extrema      │  │
│  │       + SSR en Cloudflare Workers/Pages para admin/APIs)   │  │
│  │     • Componentes modulares basados en Propuesta 02        │  │
│  └──────────────────────────────┬─────────────────────────────┘  │
│                                 │                                │
│  ┌──────────────────────────────▼─────────────────────────────┐  │
│  │                   Hono API Framework                       │  │
│  │     • API REST ultra-ligera en TypeScript                  │  │
│  │     • Integrable nativamente dentro de Astro / Cloudflare  │  │
│  │     • Endpoints públicos y rutas protegidas de Admin       │  │
│  └───────────────┬────────────────────────────┬───────────────┘  │
└──────────────────┼────────────────────────────┼──────────────────┘
                   │                            │
                   ▼                            ▼
┌──────────────────────────────────┐ ┌─────────────────────────────┐
│       SUPABASE (POSTGRESQL)      │ │        CLOUDFLARE R2        │
│                                  │ │     (Bucket: pelechuco)     │
│ • Tablas relacionales normalizadas│ │                             │
│ • Row Level Security (RLS)       │ │ • Portada / Hero            │
│ • Único rol: Administrador       │ │ • Fotos Conoce Pelechuco    │
│ • Script DDL: database/schema.sql│ │ • Galería de Imágenes       │
│ • Datos: database/seed.sql       │ │ • Fotos de Autoridades      │
│ • Diagrama: database/ERD.md      │ │ • Formularios PDF trámites  │
│                                  │ │ • Adjuntos de noticias      │
└──────────────────────────────────┘ └─────────────────────────────┘
```

---

## 3. Ubicación de Archivos Clave en el Repositorio

- **Diseño HTML/CSS de Referencia (Base Visual Exacta)**:
  - HTML Oficial: `pelechuco-design-proposals/proposals/02-territorio-naturaleza.html`
  - CSS Oficial: `pelechuco-design-proposals/css/proposal-02.css`
  - CSS Base/Reset: `pelechuco-design-proposals/css/styles.css`
  - Escudo Vectorial Oficial: `pelechuco-design-proposals/assets/images/escudo-pelechuco.svg`
- **Base de Datos PostgreSQL (Supabase)**:
  - Esquema DDL con RLS: `database/schema.sql` (y `supabase/migrations/20261028000000_pelechuco_schema.sql`)
  - Semilla con datos reales: `database/seed.sql`
  - Diagrama Entidad-Relación: `database/ERD.md`
- **Datos de prueba y modelos en JavaScript**:
  - `pelechuco-design-proposals/js/proposals.js` (`PELECHUCO_DATA`)
  - `pelechuco-design-proposals/js/interactions.js` (Lógica de filtrado de noticias y trámites)
  - `pelechuco-design-proposals/admin/panel.html` (Referencia visual del panel administrativo)

---

## 4. Mapeo de Secciones del Portal a la Base de Datos

| Sección del Portal | Tabla PostgreSQL | Campos Modificables | Almacenamiento R2 |
|---|---|---|---|
| **Hero / Portada** | `hero_section` | `title_main`, `title_highlight`, `subtitle`, `badge_text`, CTAs | `bg_image_url`, `bg_image_key` (`hero/`) |
| **Conoce Pelechuco (Intro)** | `conoce_intro` | `title`, `description`, `altitud`, `superficie`, `poblacion` | `image_url` (`conoce/`) |
| **Conoce Pelechuco (Bloques)**| `conoce_secciones` | `slug` ('historia', 'cultura', 'comunidades'), `title`, `content` | `image_url` (`conoce/`) |
| **Galería Municipal** | `galeria_imagenes` | `title`, `description`, `category`, `display_order`, `is_active` | `image_url` (`galeria/`) |
| **Noticias y Comunicados** | `noticias` | `title`, `slug`, `summary`, `content`, `category_id`, `status` | `featured_image_url` (`noticias/`) |
| **Adjuntos de Noticias** | `noticias_adjuntos`| `file_title`, `file_name`, `file_size_bytes` | `file_url` (`noticias/docs/`) |
| **Autoridades** | `autoridades` | `name`, `position`, `area`, `biography`, `institutional_contact` | `photo_url` (`autoridades/`) |
| **Categorías de Trámites** | `tramites_categorias`| `name`, `slug`, `description`, `icon`, `is_active` (100% dinámicas)| N/A |
| **Trámites y Servicios** | `tramites` | `title`, `slug`, `description`, `requirements` (JSONB), `cost`, `plazo` | N/A |
| **Formularios PDF Trámites** | `tramites_archivos` | `file_title`, `file_name`, `file_size_bytes` | `file_url` (`tramites/`) |
| **Contacto y Atención** | `contacto_config` | Dirección, teléfonos, WhatsApp, horarios, mapa lat/lng | N/A |
| **Redes Sociales** | `redes_sociales` | `platform`, `name`, `url`, `handle`, `is_active`, `display_order` | N/A |
| **Biblioteca Central R2** | `r2_media` | Catálogo centralizado de todos los archivos en Cloudflare R2 | Objeto R2 |
| **Buzón Ciudadano** | `mensajes_contacto` | Formulario de contacto recibido para lectura del admin | N/A |

---

## 5. Estructura de Proyecto Recomendada (Astro + Hono)

```
alcaldia/
├── src/
│   ├── layouts/
│   │   ├── BaseLayout.astro          ← Layout principal con CSS de P02 y meta tags
│   │   └── AdminLayout.astro         ← Layout del panel de gestión
│   ├── components/
│   │   ├── Header.astro              ← Menú institucional sticky y drawer móvil
│   │   ├── Hero.astro                ← Portada dinámica con imagen R2
│   │   ├── ConocePelechuco.astro     ← Intro + Historia + Cultura + Comunidades
│   │   ├── Galeria.astro             ← Grid fotográfico con lightbox
│   │   ├── NoticiasSection.astro     ← Filtros por categoría y buscador interactivo
│   │   ├── NoticiaCard.astro         ← Tarjeta editorial con imagen R2
│   │   ├── AutoridadesSection.astro  ← Grid de autoridades municipales
│   │   ├── TramitesSection.astro     ← Catálogo de trámites con acordeón y requisitos
│   │   ├── ContactoSection.astro     ← Formulario funcional y mapa
│   │   └── Footer.astro              ← 4 columnas + redes oficiales
│   ├── pages/
│   │   ├── index.astro               ← Portal principal público (SSG/SSR)
│   │   ├── noticias/[slug].astro     ← Detalle de noticia con adjuntos PDF
│   │   ├── tramites/[slug].astro     ← Detalle de trámite y descarga de formulario
│   │   ├── admin/                    ← Panel de administración (Protegido)
│   │   │   ├── index.astro           ← Dashboard general
│   │   │   ├── noticias/             ← CRUD de noticias
│   │   │   ├── tramites/             ← CRUD de trámites y categorías
│   │   │   ├── autoridades/          ← CRUD de autoridades
│   │   │   ├── media/                ← Gestor de Cloudflare R2
│   │   │   └── configuracion/        ← Hero, Conoce, Contacto y Redes
│   │   └── api/[...slug].ts          ← Rutas Hono API montadas en Astro
│   ├── lib/
│   │   ├── supabase.ts               ← Cliente Supabase con tipos generados
│   │   ├── r2.ts                     ← Cliente S3/Cloudflare R2 para subida/borrado
│   │   └── hono-app.ts               ← Instancia y middleware de Hono
│   └── styles/
│       ├── global.css                ← Variables de diseño P02 (#2D5016, #E4DAC3, etc.)
│       └── typography.css            ← Playfair Display y Lato
├── database/
│   ├── schema.sql                    ← DDL de Supabase
│   ├── seed.sql                      ← Datos semilla de Pelechuco
│   └── ERD.md                        ← Diagrama MER
├── astro.config.mjs                  ← Configuración Astro con adaptador @astrojs/cloudflare
├── wrangler.toml                     ← Configuración de Cloudflare Pages / R2 bindings
└── package.json
```

---

## 6. Autenticación de Administradores

- **Sin Roles Múltiples**: Existe una sola categoría de cuenta con privilegios totales: **Administrador**.
- La tabla `public.admin_users` se enlaza 1 a 1 con `auth.users(id)` de Supabase.
- Los administradores autenticados pueden registrar nuevos administradores o eliminarlos desde el panel.
- Todas las mutaciones de base de datos están protegidas a nivel de base de datos con **PostgreSQL RLS (`is_admin()`)**.
