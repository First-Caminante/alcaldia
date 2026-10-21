# PELECHUCO DIGITAL — Propuestas de Diseño Institucional

> **Gobierno Autónomo Municipal de Pelechuco**  
> Provincia Franz Tamayo · Departamento de La Paz · Bolivia  
> Prototipo Frontend de 8 Alternativas de Diseño Institucional Web.

---

## 📌 Acceso Rápido a las 8 Propuestas

| # | Propuesta | Enfoque & Personalidad | Paleta Principal | Archivo Directo |
|---|---|---|---|---|
| **00** | **Galería de Presentación** | Portal central de selección y comparación | Oscuro / Estudio | [`pelechuco-design-proposals/index.html`](pelechuco-design-proposals/index.html) |
| **01** | **Andes Institucional** | Formal, sobria, moderna y gubernamental | Azul Profundo, Blanco, Verde Andino | [`01-andes-institucional.html`](pelechuco-design-proposals/proposals/01-andes-institucional.html) |
| **02** | **Territorio y Naturaleza** | Visual, paisajística, turística y editorial | Verde Bosque, Piedra, Arena | [`02-territorio-naturaleza.html`](pelechuco-design-proposals/proposals/02-territorio-naturaleza.html) |
| **03** | **Gobierno Abierto** | Transparencia, servicios y doble cabecera | Azul Institucional, Naranja Acento | [`03-gobierno-abierto.html`](pelechuco-design-proposals/proposals/03-gobierno-abierto.html) |
| **04** | **Pelechuco Contemporáneo** | Minimalista, editorial y hero asimétrico | Marfil, Negro Suave, Verde | [`04-pelechuco-contemporaneo.html`](pelechuco-design-proposals/proposals/04-pelechuco-contemporaneo.html) |
| **05** | **Comunidad y Servicio** | Humana, cercana, mobile-first y directa | Verde Natural, Azul, Fondos Claros | [`05-comunidad-servicio.html`](pelechuco-design-proposals/proposals/05-comunidad-servicio.html) |
| **06** | **Ciudad Viva (lapaz.bo)** | Creativa, vibrante, interactiva con ticker y superbuscador | Azul Eléctrico, Amarillo Oro, Pizarra | [`06-metropoli-ciudad-viva.html`](pelechuco-design-proposals/proposals/06-metropoli-ciudad-viva.html) |
| **07** | **Andes Neo-Digital** | Vanguardista, glassmorphism, bento grid y modo oscuro | Obsidiana, Turquesa Glaciar, Esmeralda | [`07-andes-neo-digital.html`](pelechuco-design-proposals/proposals/07-andes-neo-digital.html) |
| **08** | **Territorio Cálido & Raíces** | Cálida, comunitaria, raíces andinas y stepper | Terracota, Ocre Sol, Verde Queñua | [`08-territorio-calido.html`](pelechuco-design-proposals/proposals/08-territorio-calido.html) |
| **--** | **Panel de Administración** | Prototipo conceptual del gestor de contenidos | Gris / Slate Funcional | [`admin/panel.html`](pelechuco-design-proposals/admin/panel.html) |

---

## 🚀 Despliegue en GitHub Pages

Este proyecto utiliza **rutas relativas estrictas** y no requiere compilación, Node.js ni servidor backend. Es 100% compatible con **GitHub Pages**:

1. Haz commit y push de los cambios:
   ```bash
   git add .
   git commit -m "feat: 8 propuestas completas de diseño para GAM Pelechuco"
   git push origin main
   ```
2. En tu repositorio de GitHub, ve a **Settings** > **Pages**.
3. En **Source**, selecciona `Deploy from a branch`.
4. Elige la rama `main` y la carpeta `/ (root)`.
5. Haz clic en **Save**. En 1-2 minutos tu web estará disponible en:
   `https://<tu-usuario>.github.io/<tu-repositorio>/`

---

## 🛠️ Tecnologías y Características

- **HTML5 Semántico** con atributos ARIA y skip links para accesibilidad.
- **CSS3 Personalizado & Animaciones**: `@keyframes`, micro-interacciones, scroll reveal con `IntersectionObserver`, glassmorphism y transiciones suaves.
- **Tailwind CSS (Play CDN)** para utilidades base sin proceso de build.
- **JavaScript Vanilla (ES6+)**: Buscador central reactivo con autofill de sugerencias, filtrado dinámico de comunicados, catálogo interactivo de trámites, modales accesibles y navegación sincronizada entre propuestas.
- **Google Fonts**: Inter, Playfair Display, Roboto, DM Sans, Nunito, Plus Jakarta Sans, Cabinet Grotesk, Space Grotesk, Fraunces y Outfit.
- **Integridad de Datos**: Datos institucionales completos y verosímiles de Pelechuco (historia, geografía, 9 cantones y ayllus, autoridades oficiales, organigrama visual interactivo, georreferenciación y escudo heráldico vectorial).
