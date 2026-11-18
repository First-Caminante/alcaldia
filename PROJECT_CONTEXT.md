# MANUAL MAESTRO DE CONTEXTO TÉCNICO Y ARQUITECTURA
## GOBIERNO AUTÓNOMO MUNICIPAL DE PELECHUCO — PORTAL OFICIAL Y PANEL CMS

> **Propósito de este documento:** Este archivo contiene el contexto integral, exhaustivo y absoluto de todo el proyecto GAM Pelechuco (código, base de datos, infraestructura, diseño, credenciales, historial y despliegue). Ha sido concebido para permitir que cualquier nueva instancia, desarrollador o agente de Inteligencia Artificial retome el proyecto inmediatamente sin pérdida de información ni necesidad de diagnósticos previos.

---

## 1. FICHA TÉCNICA Y RESUMEN EJECUTIVO

* **Entidad:** Gobierno Autónomo Municipal de Pelechuco (Segunda Sección Municipal, Provincia Franz Tamayo, Departamento de La Paz, Bolivia).
* **Tipo de Proyecto:** Portal Ciudadano Oficial de Gobierno Abierto + Sistema de Gestión de Contenidos (CMS / Panel Administrativo).
* **Estado en Producción:** **100% Operativo y Desplegado.**
* **URL Oficial del Portal:** [https://portal.pelechuco.workers.dev](https://portal.pelechuco.workers.dev)
* **URL del Panel Administrativo:** [https://portal.pelechuco.workers.dev/admin/login](https://portal.pelechuco.workers.dev/admin/login)
* **Subdominio de Cuenta Cloudflare:** `pelechuco.workers.dev`
* **Nombre del Worker:** `portal`
* **Repositorio Git Oficial:** `git@github.com:First-Caminante/alcaldia.git`
* **Rama Principal:** `main` (rastreada contra `origin/main`).

---

## 2. STACK TECNOLÓGICO Y DECISIONES DE ARQUITECTURA

| Capa | Tecnología | Versión | Justificación Técnica |
| :--- | :--- | :--- | :--- |
| **Framework Web** | Astro | `^7.4.2` | Renderizado híbrido SSR (`output: 'server'`), empaquetado optimizado de assets estáticos y generación de HTML ultrarrápido con cero sobrecarga de JavaScript en el cliente. |
| **Adapter Cloudflare** | `@astrojs/cloudflare` | `^14.4.2` | Compilación directa hacia Cloudflare Workers con arquitectura moderna de **Static Assets** (reemplazando el motor heredado de Pages). |
| **API Backend** | Hono | `^4.13.14` | Router REST ultra-ligero montado sobre la ruta catch-all `src/pages/api/[...slug].ts`. Ejecución nativa sin Node.js runtime en el edge de Cloudflare. |
| **Base de Datos** | Supabase (PostgreSQL 15) | `@supabase/supabase-js ^2.118.0` | Base relacional con soporte nativo de UUID, Row Level Security (RLS), funciones en PL/pgSQL, triggers y vistas materializadas en JSON. |
| **Autenticación** | Supabase Auth (JWT) | v2 | Gestión de tokens JWT para administradores municipales con sincronización bidireccional en cookies (`gam_admin_token`) y `localStorage`. |
| **Almacenamiento** | Supabase Storage | Bucket `pelechuco-media` | Almacenamiento público para imágenes (WebP, JPG, PNG) y documentos descargables (PDF, DOCX) con límite de 10 MB por archivo. |
| **Motor de Servidor** | Cloudflare Workers | Compatibilidad `2024-09-23` con `nodejs_compat` | Servidor edge global con tiempos de respuesta menores a 20 ms y SSL automático. |
| **Diseño y Estilos** | CSS Moderno Nativo | Vanilla CSS + Variables | Sistema basado en la **Propuesta 02: Territorio y Naturaleza** con soporte nativo de Modo Claro / Modo Oscuro y escala responsiva compacta. |

---

## 3. CREDENCIALES, SECRETOS Y VARIABLES DE ENTORNO

### 3.1. Supabase (Base de Datos & Auth)
* **Project URL:** `https://pjgmzkiceyrkzhgemsuw.supabase.co`
* **Anon / Public Key:** `sb_publishable_5wrZZy2uzGpvDGb7B1nGxA_x0JDoGE2`
* **Service Role Key:** `sb_secret_***` *(Almacenado de forma segura en el archivo local `.env` como `SUPABASE_SERVICE_ROLE_KEY` y en los Cloudflare Worker Secrets del proyecto `portal`)*

### 3.2. Cuenta Oficial de Administrador Municipal
* **Correo Institucional:** `admin@pelechuco.gob.bo`
* **Contraseña Oficial:** `Pelechuco2026*`
* **UUID de Usuario (auth.users / admin_users):** `e9aee443-8505-4995-bf1d-ebb65b9c3eab`
* **Nombre Completo:** `Administrador General GAM`
* **Rol:** Administrador con privilegios de lectura, inserción, edición y eliminación en todas las tablas del portal.

### 3.3. Cloudflare Deployment
* **Token de API Cloudflare (Permisos Workers / DNS):**
  `cfut_***` *(Configurado en entorno local o exportado en sesión como `CLOUDFLARE_API_TOKEN`)*
* **Cuenta Cloudflare:** Asociada al correo `i.am.caminante@gmail.com`.
* **Subdominio activo:** `pelechuco.workers.dev`

---

## 4. ESQUEMA DE BASE DE DATOS (SUPABASE POSTGRESQL)

El esquema completo reside en [`database/schema.sql`](file:///home/caminante/projectspersonales/alcaldia/database/schema.sql) y los datos semilla en [`database/seed.sql`](file:///home/caminante/projectspersonales/alcaldia/database/seed.sql).

### 4.1. Tablas del Sistema

1. **`admin_users`**
   * Controla a los usuarios con permisos administrativos dentro del CMS.
   * Campos: `id (UUID, PK -> auth.users)`, `email (TEXT, UNIQUE)`, `full_name (TEXT)`, `avatar_url (TEXT)`, `phone (TEXT)`, `is_active (BOOLEAN)`, `last_login_at (TIMESTAMPTZ)`, `created_at`, `updated_at`.
   * Trigger: `on_auth_user_created` registra automáticamente cualquier nuevo registro de `auth.users` en `admin_users`.

2. **`r2_media`**
   * Catálogo de archivos multimedia subidos al bucket `pelechuco-media`.
   * Campos: `id (UUID, PK)`, `file_key (TEXT, UNIQUE)`, `public_url (TEXT)`, `bucket_name (TEXT)`, `file_name (TEXT)`, `mime_type (TEXT)`, `file_size_bytes (BIGINT)`, `folder (TEXT: hero, conoce, galeria, noticias, autoridades, tramites, general)`, `uploaded_by (UUID -> admin_users)`, `created_at`.

3. **`hero_section`**
   * Configuración de la cabecera principal del portal.
   * Campos: `id (INT=1, PK)`, `badge_text`, `title_main`, `title_highlight`, `subtitle`, `bg_image_url`, `bg_image_key`, `cta_primary_text`, `cta_primary_link`, `cta_secondary_text`, `cta_secondary_link`, `is_active`, `updated_at`.

4. **`conoce_intro`**
   * Ficha geográfica y de identidad territorial de Pelechuco.
   * Campos: `id (INT=1, PK)`, `title`, `description`, `image_url`, `image_key`, `altitud` (3.600 m s.n.m.), `superficie` (2.714 km²), `poblacion` (6.850 hab.), `cantones_texto`, `updated_at`.

5. **`conoce_secciones`**
   * Bloques informativos temáticos (Cultura y Comunidades, Historia, Geografía).
   * Campos: `id (UUID, PK)`, `slug (TEXT, UNIQUE)`, `title`, `subtitle`, `content`, `image_url`, `image_key`, `image_alt`, `display_order (INT)`, `is_active (BOOLEAN)`.

6. **`galeria_imagenes`**
   * Imágenes destacadas de paisajes, fauna (vicuñas/alpacas), obras y festividades.
   * Campos: `id (UUID, PK)`, `title`, `alt_text`, `image_url`, `image_key`, `category (TEXT: paisaje, cultura, fauna, obras, institucional)`, `display_order (INT)`, `is_active (BOOLEAN)`.

7. **`noticias_categorias`**
   * Clasificación de boletines (Obras, Institucional, Cultura, Avisos Oficiales).
   * Campos: `id (UUID, PK)`, `name`, `slug (TEXT, UNIQUE)`, `color_hex`, `description`, `display_order`.

8. **`noticias`**
   * Comunicados, convocatorias públicas y notas de prensa.
   * Campos: `id (UUID, PK)`, `title`, `slug (TEXT, UNIQUE)`, `summary`, `content`, `featured_image_url`, `featured_image_key`, `video_url` (soporta YouTube con parsing automático), `gallery_images (JSONB: array de URLs)`, `category_id (UUID -> noticias_categorias)`, `author_id (UUID -> admin_users)`, `status (TEXT: borrador, publicado, archivado)`, `published_at`, `views_count (INT)`.

9. **`noticias_adjuntos`**
   * Decretos, resoluciones y documentos anexos en formato PDF/Word.
   * Campos: `id (UUID, PK)`, `noticia_id (UUID -> noticias)`, `title`, `file_url`, `file_key`, `file_type`, `file_size_bytes`.

10. **`autoridades`**
    * Nómina del Ejecutivo Municipal y Concejo.
    * Campos: `id (UUID, PK)`, `name`, `position` (Alcalde Municipal, Presidente del Concejo, etc.), `area`, `biography`, `photo_url`, `photo_key`, `institutional_contact`, `phone`, `display_order (INT)`, `is_active (BOOLEAN)`.

11. **`tramites_categorias`**
    * Categorías ciudadanas (Registro Civil, Catastro y Urbanismo, Licencias, etc.).
    * Campos: `id (UUID, PK)`, `name`, `slug (TEXT, UNIQUE)`, `icon` (Emoji oficial), `description`, `display_order`.

12. **`tramites`**
    * Guía de trámites con costo, plazos, oficina y requisitos interactivos.
    * Campos: `id (UUID, PK)`, `title`, `slug (TEXT, UNIQUE)`, `category_id (UUID -> tramites_categorias)`, `description`, `requirements (JSONB: lista de requisitos)`, `cost` (Arancel oficial o 'Gratuito'), `processing_time`, `office`, `schedule`, `responsible_unit`, `image_url`, `video_url`, `document_url`, `document_name`, `status (TEXT)`, `is_featured (BOOLEAN)`.

13. **`tramites_archivos`**
    * Formularios descargables para tramitación ciudadana.

14. **`contacto_config`**
    * Central telefónica, WhatsApp oficial, dirección de Casa Consistorial y mapas embed de Google Maps.
    * Campos: `id (INT=1, PK)`, `address_primary`, `phone_central`, `phone_whatsapp`, `emergency_line`, `email_general`, `schedule_weekdays`, `map_embed_url`.

15. **`redes_sociales`**
    * Canales institucionales oficiales (Facebook, WhatsApp, YouTube, TikTok).

16. **`mensajes_contacto`**
    * Buzón ciudadano / Mesa de partes virtual para solicitudes o reclamos enviados desde el portal.

### 4.2. Vista Consolidada de Alto Rendimiento (`v_portal_publico`)
```sql
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
```
* **Ventaja:** En [`src/pages/index.astro`](file:///home/caminante/projectspersonales/alcaldia/src/pages/index.astro), el portal realiza una única llamada a `v_portal_publico`, obteniendo todos los datos en un único round-trip con fallback automático a [`src/lib/data-defaults.ts`](file:///home/caminante/projectspersonales/alcaldia/src/lib/data-defaults.ts).

### 4.3. Seguridad Row Level Security (RLS)
* **Lectura Pública:** Permite que cualquier visitante sin credenciales consulte contenidos publicados (`status = 'publicado'`, `is_active = true`).
* **Escritura Administrativa:** Restringida mediante la función SQL:
  ```sql
  CREATE OR REPLACE FUNCTION public.is_admin()
  RETURNS BOOLEAN AS $$
  BEGIN
    RETURN EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE id = auth.uid() AND is_active = true
    );
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;
  ```

---

## 5. ESTRUCTURA Y ARCHIVOS DEL PROYECTO

```
alcaldia/
├── astro.config.mjs             # Configuración Astro SSR + @astrojs/cloudflare (session: false)
├── database/
│   ├── schema.sql               # Esquema DDL completo de PostgreSQL / Supabase
│   └── seed.sql                 # Semilla de datos institucionales de Pelechuco
├── dist/                        # Build de producción empaquetado para Cloudflare Workers
├── package.json                 # Dependencias (Astro, Hono, Supabase, Cloudflare, Emnapi)
├── package-lock.json            # Lockfile congelado con soporte npm ci
├── src/
│   ├── components/
│   │   ├── AutoridadesSection.astro  # Tarjetas de autoridades con modal de credencial nativo <dialog>
│   │   ├── ConocePelechuco.astro     # Secciones alternadas de territorio, cultura y cantones
│   │   ├── ContactoSection.astro     # Mapa doble (Alcaldía/Comunidades), teléfonos y formulario
│   │   ├── Footer.astro              # Pie institucional de 4 columnas con enlaces y admin tag
│   │   ├── Galeria.astro             # Marquee infinito interactivo y lightbox nativo
│   │   ├── Header.astro              # Cabecera sticky con logo SVG, alternador Dark/Light y menú drawer
│   │   ├── Hero.astro                # Portada con cumbres nevadas, badge y banda editorial
│   │   ├── NoticiaCard.astro         # Card individual con carrusel de fotos y badge de video
│   │   ├── NoticiasSection.astro     # Noticia destacada horizontal + grilla de comunicados
│   │   └── TramitesSection.astro     # Catálogo con view switcher (⊞ Cuadrícula / ☰ Lista) y modal
│   ├── layouts/
│   │   ├── AdminLayout.astro         # Layout del panel administrativo con protección SSR y tema oscuro
│   │   └── BaseLayout.astro          # Layout del portal público con Google Fonts y meta tags
│   ├── lib/
│   │   ├── data-defaults.ts          # Datos estáticos fallback si falla la conexión a BD
│   │   ├── hono-app.ts               # Router Hono con 34 endpoints REST para el CMS
│   │   ├── storage.ts                # Gestión de subida y sincronización en Supabase Storage
│   │   ├── supabase.ts               # Clientes Supabase (Público, Authenticated y Service Role)
│   │   └── youtube.ts                # Parser de enlaces regulares y Shorts de YouTube a embeds
│   ├── middleware.ts                 # Guardia de seguridad global en el edge (HTTP 302 a /admin/login)
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── autoridades.astro     # CRUD de autoridades municipales
│   │   │   ├── configuracion.astro   # Configuración de hero, portada y colores
│   │   │   ├── contacto.astro        # Configuración de teléfonos, redes y mapas
│   │   │   ├── galeria.astro         # CRUD de fotos para la galería
│   │   │   ├── index.astro           # Dashboard con métricas y accesos rápidos
│   │   │   ├── login.astro           # Pantalla de acceso administrativo
│   │   │   ├── media.astro           # Gestor de archivos multimedia subidos
│   │   │   ├── mensajes.astro        # Bandeja de entrada de mensajes ciudadanos
│   │   │   ├── noticias.astro        # CRUD de noticias con editor de texto y fotos
│   │   │   └── tramites.astro        # CRUD de trámites, aranceles y requisitos
│   │   ├── api/
│   │   │   └── [...slug].ts          # Catch-all que entrega las peticiones a Hono
│   │   ├── noticias/
│   │   │   └── [slug].astro          # Ficha individual completa de comunicado/noticia
│   │   ├── tramites/
│   │   │   └── [slug].astro          # Ficha individual completa de trámite municipal
│   │   └── index.astro               # Página de inicio del portal público
│   ├── styles/
│   │   ├── global.css                # Variables CSS, esquema Dark/Light, reset y escala responsiva
│   │   ├── proposal-02.css           # Estilos específicos de Propuesta 02 (Territorio y Naturaleza)
│   │   ├── styles.css                # Estilos base y utilitarios compartidos
│   │   └── typography.css            # Tipografías Playfair Display, Lato e Inter
│   └── types/
│       └── database.ts               # Interfaces TypeScript para todo el modelo de datos
├── tsconfig.json                # Configuración de TypeScript
└── wrangler.toml                # Manifiesto de Cloudflare Workers (name = "portal")
```

---

## 6. SISTEMA DE DISEÑO (PROPUESTA 02: TERRITORIO Y NATURALEZA)

### 6.1. Paleta de Colores Institucional
* **Verde Pino Andino (`--primary`):** `#2D5016` (Claro) / `#4C8228` (Oscuro).
* **Verde Profundo (`--primary-dark`):** `#1A3008` (Claro) / `#32581A` (Oscuro).
* **Azul Glaciar Apolobamba (`--secondary`):** `#4A7FA5` (Claro) / `#6097C2` (Oscuro).
* **Dorado Textil / Vicuña (`--accent`):** `#C4A882` (Claro) / `#D4BA96` (Oscuro).
* **Fondo Piedra Arenisca (`--bg`):** `#E4DAC3` (Claro) / `#121811` (Noche Andina).
* **Fondo Alternado (`--bg-alt`):** `#D5C9AE` (Claro) / `#1A2218` (Noche Andina).
* **Tarjetas (`--card-bg`):** `#F4EFE2` (Claro) / `#212D1F` (Noche Andina).
* **Texto Principal (`--text`):** `#182610` (Claro) / `#F3F1EC` (Noche Andina).
* **Texto Secundario (`--text-muted`):** `#485A3F` (Claro) / `#A8BCA0` (Noche Andina).

### 6.2. Tipografías Oficiales
* **Titulares y Énfasis (`--font-serif`):** `'Playfair Display', Georgia, serif;`
* **Cuerpo y Lectura (`--font-sans`):** `'Lato', -apple-system, BlinkMacSystemFont, sans-serif;`
* **Panel Administrativo (`--font-admin`):** `'Inter', system-ui, sans-serif;`

### 6.3. Escala Responsiva Compacta (Evita efecto de zoom excesivo)
En [`src/styles/global.css`](file:///home/caminante/projectspersonales/alcaldia/src/styles/global.css):
* **Desktop:** `html { font-size: 15px; }` (Ajuste estilizado y de alta densidad).
* **Tablets y Móviles (`<= 768px`):** `html { font-size: 14px; }` (Reduce armónicamente todos los `rem` de títulos, márgenes y tarjetas, impidiendo que el contenido se vea desproporcionado).
* **Móviles muy compactos (`<= 380px`):** `html { font-size: 13.5px; }`.

---

## 7. CRONOLOGÍA DE DESPLIEGUE Y PROBLEMAS RESUELTOS

A lo largo del proyecto se resolvieron problemas críticos de configuración e infraestructura que **no deben repetirse**:

### 1. Error de dependencia `@emnapi/core` durante `npm ci`
* **Problema:** El entorno de construcción automatizada de Cloudflare ejecutaba `npm ci`, pero fallaba con `Missing: @emnapi/core@1.11.3 from lock file`.
* **Solución:** Se añadieron explícitamente `@emnapi/core@1.11.3` y `@emnapi/runtime@1.11.3` en `devDependencies` de [`package.json`](file:///home/caminante/projectspersonales/alcaldia/package.json) y se regeneró [`package-lock.json`](file:///home/caminante/projectspersonales/alcaldia/package-lock.json).

### 2. Error de bindings y KV en Cloudflare Pages (`ASSETS is reserved`)
* **Problema:** En Astro 5 con `@astrojs/cloudflare` v14, Cloudflare Pages lanzaba `The name 'ASSETS' is reserved in Pages projects` y fallos por un namespace de KV no aprovisionado (`SESSION`).
* **Solución:**
  * En [`astro.config.mjs`](file:///home/caminante/projectspersonales/alcaldia/astro.config.mjs), se fijó `session: false`.
  * Se configuró el despliegue hacia **Cloudflare Workers con Static Assets**, eliminando `pages_build_output_dir` y directivas obsoletas de Pages.

### 3. Rediseño del Catálogo de Trámites
* **Problema:** Las tarjetas de trámites tenían un layout rígido con vacíos oscuros cuando no había fotografía disponible.
* **Solución:** Se implementó en [`TramitesSection.astro`](file:///home/caminante/projectspersonales/alcaldia/src/components/TramitesSection.astro) un selector de vista (`⊞ Cuadrícula` / `☰ Lista horizontal`), un banner de 145px para imágenes reales y un banner andino con marca de agua y emblema heráldico de 110px para tarjetas sin foto, con modal nativo `<dialog>` y botón de copiado de requisitos al portapapeles.

### 4. Empaquetado nativo de CSS (Pérdida de estilos en producción)
* **Problema:** En el primer despliegue a Workers, el sitio cargó en HTML plano sin estilos porque los layouts usaban etiquetas `<link rel="stylesheet" href="/src/styles/...">` sin procesar por Vite.
* **Solución:** Se reemplazaron por importaciones nativas en el frontmatter de Astro (`import '../styles/global.css';` en `BaseLayout.astro` e `import '../styles/styles.css';` en `AdminLayout.astro`). Astro genera los bundles estáticos con caché inmutable `/_astro/Footer.*.css` y `/_astro/AdminLayout.*.css`.

### 5. URL Limpia y Supresión de Duplicados
* **Problema:** La URL inicial asignada por Wrangler era larga (`gam-pelechuco.i-am-caminante.workers.dev`).
* **Solución:**
  * Se actualizó el subdominio de cuenta a `pelechuco.workers.dev`.
  * Se renombró el worker a `portal` en [`wrangler.toml`](file:///home/caminante/projectspersonales/alcaldia/wrangler.toml).
  * La URL resultante quedó limpia y oficial: `https://portal.pelechuco.workers.dev`.
  * Se eliminó el worker antiguo con `wrangler delete --name gam-pelechuco --force`.

### 6. Parpadeo del Dashboard para usuarios no autenticados (FOUC de Admin)
* **Problema:** Al hacer clic en "⚙️ Admin", se descargaba el HTML del dashboard y se renderizaba por medio segundo antes de que un script al final de la página ejecutara la redirección.
* **Solución:** Se creó [`src/middleware.ts`](file:///home/caminante/projectspersonales/alcaldia/src/middleware.ts). En el edge de Cloudflare, si la petición va a `/admin*` (excepto `/admin/login`) y no contiene la cookie `gam_admin_token`, el Worker intercepta la petición y devuelve un **`HTTP 302 Found` inmediato** hacia `/admin/login`. Ningún byte del panel se envía al cliente no autorizado.

### 7. Pantalla oscura / Dashboard en blanco tras iniciar sesión
* **Problema:** En un intento previo de evitar el parpadeo, se insertó `<style id="auth-guard-cloak"> body { visibility: hidden !important; } </style>` con la intención de removerlo con JS en el cliente. El compilador de Astro extrajo la regla dentro de `AdminLayout.*.css`, provocando que el `<body>` quedara oculto permanentemente para todos los usuarios.
* **Solución:** Se retiró totalmente la regla CSS y se delegó la protección exclusivamente a `src/middleware.ts` en el servidor y a la comprobación de cookies en el layout. El panel ahora carga inmediatamente con su contenido visible al 100%.

---

## 8. COMANDOS OPERATIVOS DE MANTENIMIENTO Y DESPLIEGUE

### 8.1. Desarrollo Local
```bash
# Iniciar servidor de desarrollo en http://localhost:4321
npm run dev
```

### 8.2. Compilación de Prueba
```bash
# Comprobar que no existan errores de tipos ni de bundling
npm run build
```

### 8.3. Despliegue a Producción (Cloudflare Workers)
```bash
# Despliegue con el token de API oficial (o teniendo exportado CLOUDFLARE_API_TOKEN)
CLOUDFLARE_API_TOKEN="<TU_CLOUDFLARE_API_TOKEN>" npx wrangler deploy
```

### 8.4. Gestión de Secretos en Cloudflare Worker
Si en el futuro se deben rotar o actualizar las claves de Supabase en el Worker de Cloudflare, ejecutar:
```bash
CLOUDFLARE_API_TOKEN="<TU_CLOUDFLARE_API_TOKEN>" npx wrangler secret put PUBLIC_SUPABASE_URL --name portal
CLOUDFLARE_API_TOKEN="<TU_CLOUDFLARE_API_TOKEN>" npx wrangler secret put PUBLIC_SUPABASE_ANON_KEY --name portal
CLOUDFLARE_API_TOKEN="<TU_CLOUDFLARE_API_TOKEN>" npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY --name portal
```

### 8.5. Vinculación de Dominio Gubernamental (`pelechuco.gob.bo`)
Cuando la alcaldía obtenga la delegación de su dominio oficial:
1. En el panel de Cloudflare, ingresar a **Compute (Workers & Pages)** > **portal**.
2. Ir a **Settings** > **Domains & Routes** > **Add** > **Custom Domain**.
3. Ingresar `portal.pelechuco.gob.bo` o `pelechuco.gob.bo`. Cloudflare aprovisionará los certificados TLS/SSL de forma automática y transparente sin modificar el código.

---
*Documento compilado y validado en la versión de producción `db77a77` / `ef9050f` del repositorio GAM Pelechuco.*
