# PELECHUCO DIGITAL — Propuestas de Diseño Institucional

## ¿Qué es este proyecto?

Este prototipo contiene **ocho propuestas visuales completas e interactivas** para el futuro portal institucional del **Gobierno Autónomo Municipal de Pelechuco**, ubicado en la provincia Franz Tamayo, departamento de La Paz, Bolivia.

Cada propuesta es un portal municipal completo e independiente, con su propio lenguaje visual, tipografía, paleta de colores, animaciones y personalidad. El objetivo es que las autoridades municipales puedan evaluar las alternativas de diseño y elegir una dirección visual antes del desarrollo definitivo.

> ⚠️ **Este prototipo es una demostración visual.** No es el sitio institucional oficial del Gobierno Autónomo Municipal de Pelechuco. Todos los datos, noticias, trámites y autoridades mostrados son ficticios y están identificados como contenido de demostración.

---

## Estructura de archivos

```
pelechuco-design-proposals/
├── index.html                       ← Galería principal interactiva (punto de entrada)
├── README.md                        ← Documentación del proyecto
│
├── proposals/
│   ├── 01-andes-institucional.html      ← Propuesta 01: Formal y gubernamental
│   ├── 02-territorio-naturaleza.html    ← Propuesta 02: Visual y territorial
│   ├── 03-gobierno-abierto.html         ← Propuesta 03: Transparencia y servicio
│   ├── 04-pelechuco-contemporaneo.html  ← Propuesta 04: Minimalista editorial
│   ├── 05-comunidad-servicio.html       ← Propuesta 05: Accesible y humana
│   ├── 06-metropoli-ciudad-viva.html    ← Propuesta 06: Inspiración lapaz.bo (Vibrante)
│   ├── 07-andes-neo-digital.html        ← Propuesta 07: Vanguardista glassmorphism
│   └── 08-territorio-calido.html        ← Propuesta 08: Cálida, comunitaria y humana
│
├── admin/
│   └── panel.html                   ← Panel administrativo conceptual (demo)
│
├── css/
│   ├── styles.css                   ← Estilos globales y componentes compartidos
│   ├── proposal-01.css              ← Estilos exclusivos de la Propuesta 01
│   ├── proposal-02.css              ← Estilos exclusivos de la Propuesta 02
│   ├── proposal-03.css              ← Estilos exclusivos de la Propuesta 03
│   ├── proposal-04.css              ← Estilos exclusivos de la Propuesta 04
│   ├── proposal-05.css              ← Estilos exclusivos de la Propuesta 05
│   ├── proposal-06.css              ← Estilos exclusivos de la Propuesta 06
│   ├── proposal-07.css              ← Estilos exclusivos de la Propuesta 07
│   └── proposal-08.css              ← Estilos exclusivos de la Propuesta 08
│
├── js/
│   ├── app.js                       ← Navegación global, estado, notificaciones
│   ├── proposals.js                 ← Datos de demostración (noticias, trámites, etc.)
│   ├── interactions.js              ← Filtros, búsqueda, paginación, modales
│   └── admin.js                     ← Lógica del panel administrativo conceptual
│
└── assets/
    └── images/                      ← Carpeta para imágenes oficiales futuras
```

---

## Las ocho propuestas de diseño

| # | Nombre | Personalidad | Paleta principal |
|---|--------|--------------|-----------------|
| 01 | Andes Institucional | Formal, sobria, gubernamental | Azul profundo, blanco, verde andino |
| 02 | Territorio y Naturaleza | Visual, territorial, editorial | Verde bosque, piedra, blanco cálido |
| 03 | Gobierno Abierto | Funcional, clara, informativa | Azul institucional, blanco, naranja |
| 04 | Pelechuco Contemporáneo | Minimalista, elegante, editorial | Marfil, negro suave, verde profundo |
| 05 | Comunidad y Servicio | Cercana, accesible, mobile-first | Verde natural, azul, fondos claros |
| 06 | Metrópoli / Ciudad Viva | Dinámica, inspirada en lapaz.bo, carruseles, AMI chatbot | Amarillo vibrante, azul cielo, blanco |
| 07 | Andes Neo-Digital | High-tech, glassmorphism, moderna, interactiva | Cian neón, índigo profundo, pizarra |
| 08 | Territorio Cálido & Raíces | Cálida, humana, identitaria, tipografía artesanal | Terracota, arena, verde oliva, piedra |

### Módulos incluidos en cada propuesta

- **A — Inicio**: Header institucional, hero, comunicados, noticias, accesos rápidos
- **B — Conoce Pelechuco**: Descripción, geografía, galería, historia, comunidades
- **C — Noticias y Comunicados**: Listado, filtros por categoría, búsqueda, detalle
- **D — Autoridades**: Tarjetas de cargos, organigrama conceptual
- **E — Trámites**: Catálogo, fichas con requisitos, búsqueda y filtros
- **F — Contacto**: Datos institucionales, formulario de demostración, mapa placeholder
- **G — Panel Administrativo**: Dashboard, gestión de contenidos (solo demo)
- **H — Footer**: Completo con navegación, contacto y año dinámico

---

## Cómo ejecutar localmente

### Opción 1: Abrir directamente en el navegador

Por ser una aplicación frontend estática, puede abrirse directamente:

```bash
# Navegar al directorio del proyecto
cd pelechuco-design-proposals/

# Abrir index.html en el navegador predeterminado (Linux)
xdg-open index.html

# O en macOS
open index.html
```

### Opción 2: Servidor local simple (recomendado)

Para evitar posibles problemas con rutas relativas en algunos navegadores:

```bash
# Con Python 3 (incluido en la mayoría de sistemas)
cd pelechuco-design-proposals/
python3 -m http.server 8080

# Luego abrir en el navegador: http://localhost:8080
```

```bash
# Con Node.js (si está instalado)
npx serve .

# O con http-server
npx http-server . -p 8080
```

---

## Tecnologías utilizadas

| Tecnología | Versión | Uso |
|------------|---------|-----|
| HTML5 | — | Estructura semántica |
| CSS3 | — | Estilos, animaciones, responsive |
| Tailwind CSS | Play CDN | Clases utilitarias |
| JavaScript ES6+ | — | Interacciones, navegación, datos |
| Google Fonts | — | Tipografías: Inter, Playfair Display, Roboto, DM Sans, Nunito |
| Imágenes Unsplash | — | Paisajes andinos de referencia |

> **Nota sobre Tailwind CSS Play CDN**: Este proyecto usa el CDN de Tailwind para desarrollo y prototipado rápido. Antes de una publicación institucional definitiva, se recomienda generar una versión de producción de Tailwind CSS para eliminar las clases no utilizadas y reducir el tamaño del archivo CSS.

---

## Cómo modificar el contenido

### Cambiar textos provisionales

Los textos entre corchetes como `[Añadir información oficial]` son campos pendientes de información institucional. Para modificarlos:

1. Abrir el archivo HTML correspondiente a la propuesta en un editor de texto
2. Buscar el texto entre corchetes (p. ej., `[Dirección institucional]`)
3. Reemplazarlo por el valor oficial confirmado

### Sustituir imágenes

Las imágenes actuales son fotografías de paisaje andino de Unsplash utilizadas como referencia. Para reemplazarlas:

1. Guardar las fotografías oficiales en `assets/images/`
2. En los archivos HTML, reemplazar las URLs de Unsplash por rutas relativas a las imágenes locales:

```html
<!-- Antes (imagen de referencia) -->
<img src="https://images.unsplash.com/photo-..." alt="...">

<!-- Después (imagen oficial) -->
<img src="../assets/images/nombre-imagen-oficial.jpg" alt="Descripción de la imagen">
```

### Modificar los datos de demostración

Los datos de noticias, trámites y autoridades están centralizados en:
**`js/proposals.js`**

Este archivo contiene el objeto `PELECHUCO_DATA` con todos los datos de ejemplo. Está claramente documentado para indicar qué información debe ser reemplazada por la institución.

### Cambiar colores de una propuesta

Los colores de cada propuesta están definidos como variables CSS en:
- `css/proposal-01.css` → variables `:root { --primary: ...; }`
- `css/proposal-02.css` → variables `:root { --primary: ...; }`
- etc.

Modificar el valor de `--primary` cambiará el color dominante de la propuesta.

---

## Publicar en GitHub Pages

Este prototipo es un frontend estático y se puede publicar directamente en GitHub Pages:

### Pasos:

1. **Asegurarse de que el proyecto esté en un repositorio de GitHub**
2. **Ir a Settings → Pages** en el repositorio
3. **En "Source"**, seleccionar la rama (`main`) y la carpeta (`/ (root)` o `/docs`)
4. **GitHub Pages publicará automáticamente** el sitio en `https://[usuario].github.io/[repositorio]/`

### Consideraciones:

- Si el repositorio está en la raíz, asegurarse de que `index.html` esté en la raíz del repositorio o dentro de la carpeta `pelechuco-design-proposals/`
- Todas las rutas son relativas, por lo que funcionarán correctamente en GitHub Pages
- Las imágenes de Unsplash se cargan desde internet; se cargarán siempre que haya conexión
- Si se quieren imágenes locales, guardarlas en `assets/images/` y actualizar las referencias

---

## Partes que son demostraciones visuales

Las siguientes funciones son **solo visuales** y no tienen implementación real:

| Función | Estado en la demo |
|---------|-------------------|
| Formulario de contacto | Muestra aviso, no envía datos |
| Login del panel admin | Acepta cualquier credencial, sin verificación real |
| Guardar publicaciones | Muestra notificación, no guarda nada |
| Editar autoridades | Interfaz visual, sin persistencia |
| Subir imágenes | Solo muestra aviso demo |
| Adjuntar documentos PDF | Solo muestra aviso demo |
| Compartir publicación | Solo muestra aviso demo |
| Descargar formularios | Solo muestra aviso demo |

---

## Funciones sin backend

Las siguientes funciones **requieren un backend real** antes de la publicación institucional:

- Gestión de usuarios y control de acceso
- Base de datos de noticias, trámites y autoridades
- Subida y gestión de archivos
- Formulario de contacto funcional
- Sistema de roles y permisos
- Autenticación segura con sesiones reales
- API REST o similar para consumo de datos
- Gestión de documentos PDF adjuntos

---

## Información que la alcaldía debe proporcionar

Antes de la implementación definitiva, la institución debe confirmar y validar:

- [ ] Nombre oficial completo de la institución
- [ ] Logotipo institucional en formato SVG o PNG de alta resolución
- [ ] Eslogan institucional oficial
- [ ] Dirección de la sede institucional
- [ ] Teléfonos oficiales de contacto
- [ ] Correos electrónicos institucionales
- [ ] Horarios de atención al público
- [ ] Nombres y cargos de todas las autoridades actuales
- [ ] Fotografías autorizadas de las autoridades
- [ ] Catálogo de trámites con requisitos oficiales actualizados
- [ ] Descripción oficial del municipio y su historia
- [ ] Fotografías oficiales del municipio y sus comunidades
- [ ] Datos geográficos verificados
- [ ] Canales oficiales de redes sociales (si existen)
- [ ] Políticas de privacidad y aviso legal
- [ ] Contenido del primer comunicado oficial

---

## Licencias y atribuciones

### Imágenes

Las imágenes utilizadas en este prototipo provienen de **Unsplash** (https://unsplash.com). Unsplash ofrece imágenes bajo su propia licencia que permite uso gratuito con y sin atribución en proyectos. Sin embargo, antes de la publicación institucional oficial:

1. Verificar los términos de uso actuales en https://unsplash.com/license
2. Reemplazar todas las imágenes de Unsplash por fotografías oficiales del municipio o imágenes con licencia confirmada para uso institucional
3. Obtener autorización formal para cualquier imagen que muestre personas reconocibles

**URLs de imágenes utilizadas**: Ver el archivo `js/proposals.js`, sección `imagenes`.

### Tipografías

Las tipografías provienen de **Google Fonts** (https://fonts.google.com) y se distribuyen bajo licencias abiertas (SIL Open Font License). Son libres para uso personal e institucional.

| Tipografía | Licencia | Uso en propuesta |
|------------|---------|-----------------|
| Inter | SIL OFL | P01, galería, panel admin |
| Playfair Display | SIL OFL | P02 |
| Roboto | Apache 2.0 | P03 |
| DM Sans / DM Serif Display | SIL OFL | P04 |
| Nunito | SIL OFL | P05 |
| Source Sans 3 | SIL OFL | P01 cuerpo |
| Lato | SIL OFL | P02 cuerpo |

### Tailwind CSS

Tailwind CSS se usa vía Play CDN para prototipos. En producción se recomienda instalar Tailwind vía npm y generar solo las clases utilizadas.
- Licencia: MIT
- Sitio: https://tailwindcss.com

---

## Advertencia importante sobre el panel administrativo

> ⚠️ **El panel administrativo incluido en este prototipo NO debe usarse en producción.**
>
> El panel es únicamente una demostración visual del futuro sistema de gestión. Carece de:
> - Autenticación real (cualquier credencial permite el acceso en la demo)
> - Protección de datos
> - Encriptación de contraseñas
> - Roles y permisos de usuario
> - Conexión a base de datos
> - Validación del lado del servidor
>
> Antes de publicar el panel de administración en producción, se debe desarrollar un sistema backend completo con autenticación segura, control de acceso basado en roles y protección adecuada de datos.

---

## Control de calidad

Antes de presentar este prototipo:

- [x] Las cinco propuestas existen y son navegables
- [x] Cada propuesta tiene header, hero, módulos A-H y footer
- [x] Navegación funcional entre propuestas (barra de propuestas)
- [x] Menú móvil funcional en todas las propuestas
- [x] Filtros y búsqueda de noticias operativos
- [x] Filtros y búsqueda de trámites operativos
- [x] Panel administrativo navegable
- [x] No se han inventado nombres de autoridades, teléfonos ni estadísticas
- [x] Los campos pendientes son visibles con clase `pending-field`
- [x] El contenido de demo está identificado con badges
- [x] Compatible con GitHub Pages (rutas relativas, solo frontend)
- [x] Sin dependencias de servidor ni backend

---

*Versión del prototipo: 1.0 — Octubre 2026*  
*Para uso exclusivo de presentación institucional al GAM Pelechuco*
