/**
 * PELECHUCO DIGITAL — Interacciones públicas
 * Filtros, búsqueda, paginación, detalle de noticias, trámites
 */

const Interactions = {

  // ===================== NOTICIAS =====================
  noticias: {
    datos: [],
    categoriaActiva: 'Todos',
    busqueda: '',
    pagina: 1,
    porPagina: 4,

    init(datos) {
      this.datos = datos;
      this.renderFiltros();
      this.render();
      this.bindBusqueda();
    },

    filtrados() {
      return this.datos.filter(n => {
        const catOk = this.categoriaActiva === 'Todos' || n.categoria === this.categoriaActiva;
        const busOk = !this.busqueda || 
          n.titulo.toLowerCase().includes(this.busqueda.toLowerCase()) ||
          n.resumen.toLowerCase().includes(this.busqueda.toLowerCase());
        return catOk && busOk;
      });
    },

    renderFiltros() {
      const container = document.getElementById('filtros-categorias');
      if (!container) return;
      const cats = PELECHUCO_DATA.categorias;
      container.innerHTML = cats.map(cat => `
        <button 
          class="filtro-btn ${cat === this.categoriaActiva ? 'active' : ''}"
          data-categoria="${cat}"
          aria-pressed="${cat === this.categoriaActiva}"
        >${cat}</button>
      `).join('');

      container.querySelectorAll('.filtro-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          this.categoriaActiva = btn.dataset.categoria;
          this.pagina = 1;
          this.renderFiltros();
          this.render();
        });
      });
    },

    bindBusqueda() {
      const input = document.getElementById('busqueda-noticias');
      if (!input) return;
      input.addEventListener('input', (e) => {
        this.busqueda = e.target.value;
        this.pagina = 1;
        this.render();
      });
    },

    render() {
      const container = document.getElementById('lista-noticias');
      if (!container) return;
      const filtrados = this.filtrados();
      const inicio = (this.pagina - 1) * this.porPagina;
      const pagina = filtrados.slice(inicio, inicio + this.porPagina);

      if (pagina.length === 0) {
        container.innerHTML = `
          <div class="estado-vacio">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <p>No se encontraron publicaciones con los filtros seleccionados.</p>
            <button onclick="Interactions.noticias.resetFiltros()" class="btn-reset">Ver todas las noticias</button>
          </div>
        `;
      } else {
        container.innerHTML = pagina.map(n => this.cardHTML(n)).join('');
        container.querySelectorAll('[data-noticia-id]').forEach((card, idx) => {
          card.classList.add('fade-scroll-init', 'is-visible');
          card.style.animation = `globalFadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 0.05}s both`;
          card.addEventListener('click', () => this.abrirDetalle(card.dataset.noticiaId));
        });
      }
      this.renderPaginacion(filtrados.length);
    },

    cardHTML(n) {
      const fecha = new Date(n.fecha).toLocaleDateString('es-BO', { year: 'numeric', month: 'long', day: 'numeric' });
      return `
        <article class="noticia-card" data-noticia-id="${n.id}" role="button" tabindex="0" aria-label="Leer: ${n.titulo}">
          ${n.imagen ? `
            <div class="noticia-imagen">
              <img src="${n.imagen}" alt="${n.imagenAlt}" loading="lazy" onerror="this.style.display='none'">
              ${n.esDemo ? '<span class="badge-demo">Contenido de demostración</span>' : ''}
            </div>
          ` : ''}
          <div class="noticia-contenido">
            <div class="noticia-meta">
              <span class="noticia-categoria">${n.categoria}</span>
              <time class="noticia-fecha" datetime="${n.fecha}">${fecha}</time>
            </div>
            <h3 class="noticia-titulo">${n.titulo}</h3>
            <p class="noticia-resumen">${n.resumen}</p>
            <button class="noticia-leer" data-noticia-id="${n.id}">Leer comunicado →</button>
          </div>
        </article>
      `;
    },

    abrirDetalle(id) {
      const n = this.datos.find(x => x.id == id);
      if (!n) return;
      const fecha = new Date(n.fecha).toLocaleDateString('es-BO', { year: 'numeric', month: 'long', day: 'numeric' });
      App.openModal(n.titulo, `
        ${n.esDemo ? '<div class="aviso-demo">⚠️ Contenido de demostración — No es un comunicado oficial</div>' : ''}
        <div class="noticia-detalle">
          ${n.imagen ? `<img src="${n.imagen}" alt="${n.imagenAlt}" style="width:100%;border-radius:8px;margin-bottom:1rem;" onerror="this.style.display='none'">` : ''}
          <div class="noticia-meta">
            <span class="noticia-categoria">${n.categoria}</span>
            <time datetime="${n.fecha}">${fecha}</time>
          </div>
          <p>${n.resumen}</p>
          <p style="color:var(--color-muted);font-style:italic;margin-top:1rem;">[El contenido completo del comunicado será incorporado por la institución. Este espacio está preparado para recibir el texto oficial.]</p>
          <div style="margin-top:1.5rem;padding-top:1rem;border-top:1px solid var(--color-border);">
            <button onclick="App.demoAction('Compartir no está disponible en la demo')" class="btn-compartir">Compartir publicación</button>
            <button onclick="App.demoAction('Los documentos adjuntos serán añadidos por la institución')" class="btn-adjunto">📎 Ver documentos adjuntos</button>
          </div>
        </div>
      `);
    },

    renderPaginacion(total) {
      const container = document.getElementById('paginacion-noticias');
      if (!container) return;
      const totalPags = Math.ceil(total / this.porPagina);
      if (totalPags <= 1) { container.innerHTML = ''; return; }

      container.innerHTML = `
        <button class="pag-btn" ${this.pagina <= 1 ? 'disabled' : ''} onclick="Interactions.noticias.irPagina(${this.pagina - 1})">← Anterior</button>
        <span class="pag-info">Página ${this.pagina} de ${totalPags}</span>
        <button class="pag-btn" ${this.pagina >= totalPags ? 'disabled' : ''} onclick="Interactions.noticias.irPagina(${this.pagina + 1})">Siguiente →</button>
      `;
    },

    irPagina(n) {
      this.pagina = n;
      this.render();
      document.getElementById('lista-noticias')?.scrollIntoView({ behavior: 'smooth' });
    },

    resetFiltros() {
      this.categoriaActiva = 'Todos';
      this.busqueda = '';
      this.pagina = 1;
      const input = document.getElementById('busqueda-noticias');
      if (input) input.value = '';
      this.renderFiltros();
      this.render();
    },
  },

  // ===================== TRÁMITES =====================
  tramites: {
    datos: [],
    categoriaActiva: 'Todos',
    busqueda: '',

    init(datos) {
      this.datos = datos;
      this.renderFiltros();
      this.render();
      this.bindBusqueda();
    },

    filtrados() {
      return this.datos.filter(t => {
        const catOk = this.categoriaActiva === 'Todos' || t.categoria === this.categoriaActiva;
        const busOk = !this.busqueda || t.nombre.toLowerCase().includes(this.busqueda.toLowerCase());
        return catOk && busOk;
      });
    },

    renderFiltros() {
      const container = document.getElementById('filtros-tramites');
      if (!container) return;
      const cats = PELECHUCO_DATA.categoriasTramites;
      container.innerHTML = cats.map(cat => `
        <button 
          class="filtro-btn ${cat === this.categoriaActiva ? 'active' : ''}"
          data-categoria="${cat}"
          aria-pressed="${cat === this.categoriaActiva}"
        >${cat}</button>
      `).join('');

      container.querySelectorAll('.filtro-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          this.categoriaActiva = btn.dataset.categoria;
          this.renderFiltros();
          this.render();
        });
      });
    },

    bindBusqueda() {
      const input = document.getElementById('busqueda-tramites');
      if (!input) return;
      input.addEventListener('input', (e) => {
        this.busqueda = e.target.value;
        this.render();
      });
    },

    render() {
      const container = document.getElementById('lista-tramites');
      if (!container) return;
      const filtrados = this.filtrados();

      if (filtrados.length === 0) {
        container.innerHTML = `
          <div class="estado-vacio">
            <p>No se encontraron trámites con los filtros seleccionados.</p>
          </div>
        `;
      } else {
        container.innerHTML = filtrados.map(t => this.cardHTML(t)).join('');
        container.querySelectorAll('[data-tramite-id]').forEach((card, idx) => {
          card.classList.add('fade-scroll-init', 'is-visible');
          card.style.animation = `globalFadeInUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 0.04}s both`;
        });
      }
    },

    cardHTML(t) {
      return `
        <article class="tramite-card" data-tramite-id="${t.id}">
          <div class="tramite-header">
            <span class="tramite-categoria">${t.categoria}</span>
            ${t.esDemo ? '<span class="badge-demo">Ejemplo — requiere validación</span>' : ''}
          </div>
          <h3 class="tramite-nombre">${t.nombre}</h3>
          <p class="tramite-descripcion">${t.descripcion}</p>
          <div class="tramite-info">
            <div><strong>Oficina:</strong> ${t.oficina}</div>
            <div><strong>Horario:</strong> ${t.horario}</div>
          </div>
          <button class="tramite-ver btn-primary" onclick="Interactions.tramites.abrirDetalle(${t.id})">Ver requisitos →</button>
        </article>
      `;
    },

    abrirDetalle(id) {
      const t = this.datos.find(x => x.id == id);
      if (!t) return;
      App.openModal(t.nombre, `
        <div class="aviso-demo">⚠️ Ejemplo de demostración — Los requisitos oficiales deben ser validados por la alcaldía</div>
        <p><strong>Descripción:</strong> ${t.descripcion}</p>
        <p><strong>Categoría:</strong> ${t.categoria}</p>
        <p><strong>Oficina responsable:</strong> ${t.oficina}</p>
        <p><strong>Horario:</strong> ${t.horario}</p>
        <p><strong>Ubicación:</strong> ${t.ubicacion}</p>
        <p><strong>Contacto:</strong> ${t.contacto}</p>
        <h4 style="margin-top:1rem;">Requisitos:</h4>
        <ul>
          ${t.requisitos.map(r => `<li>${r}</li>`).join('')}
        </ul>
        <div style="margin-top:1.5rem;">
          <button onclick="App.demoAction('La descarga de formularios estará disponible una vez publicado el sitio oficial')" class="btn-primary">📄 Descargar formulario (demo)</button>
        </div>
      `);
    },
  },

  // ===================== MÓDULOS DE PÁGINA =====================
  initModuloPagina(modulo) {
    if (modulo === 'noticias' && typeof PELECHUCO_DATA !== 'undefined') {
      this.noticias.init(PELECHUCO_DATA.noticias);
    }
    if (modulo === 'tramites' && typeof PELECHUCO_DATA !== 'undefined') {
      this.tramites.init(PELECHUCO_DATA.tramites);
    }
  },

};

// Inicializar formulario de contacto demo
function initContactoDemo() {
  const form = document.getElementById('form-contacto');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    App.notify('⚠️ Demostración: Este formulario no envía información. El sitio oficial contará con un formulario funcional.', 'demo');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initContactoDemo();
  // Inicializar módulos según la sección activa
  const page = document.body.dataset.page;
  if (page) Interactions.initModuloPagina(page);
});
