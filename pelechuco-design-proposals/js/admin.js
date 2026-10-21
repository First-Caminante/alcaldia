/**
 * PELECHUCO DIGITAL — Panel Administrativo Conceptual
 * 
 * IMPORTANTE: Este panel es ÚNICAMENTE una demostración visual del futuro
 * sistema de administración. NO tiene autenticación real, NO guarda datos,
 * NO debe usarse en producción sin backend, autenticación y autorización reales.
 */

const Admin = {
  seccionActiva: 'dashboard',
  noticiaEditando: null,
  
  secciones: {
    'dashboard': 'renderDashboard',
    'noticias': 'renderNoticias',
    'nueva-noticia': 'renderFormNoticia',
    'editar-noticia': 'renderFormNoticia',
    'autoridades': 'renderAutoridades',
    'tramites': 'renderTramites',
    'institucion': 'renderInstitucion',
    'contacto': 'renderContacto',
    'ajustes': 'renderAjustes',
  },

  init() {
    this.bindNavegacion();
    this.navegar('dashboard');
    this.bindLogout();
  },

  bindNavegacion() {
    document.querySelectorAll('[data-admin-nav]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.navegar(btn.dataset.adminNav);
      });
    });
  },

  bindLogout() {
    document.getElementById('btn-logout')?.addEventListener('click', () => {
      App.openModal('Cerrar sesión', `
        <p>Esta es una demostración visual. No existe una sesión real activa.</p>
        <p style="margin-top:1rem;"><a href="../index.html" class="btn-primary">Volver a la galería de propuestas</a></p>
      `);
    });
  },

  navegar(seccion, datos = null) {
    this.seccionActiva = seccion;
    if (datos) this.noticiaEditando = datos;

    // Actualizar nav activo
    document.querySelectorAll('[data-admin-nav]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.adminNav === seccion);
    });

    const main = document.getElementById('admin-main');
    if (!main) return;

    const metodo = this.secciones[seccion];
    if (metodo && this[metodo]) {
      main.innerHTML = '';
      this[metodo](main);
    }
  },

  // =========== DASHBOARD ===========
  renderDashboard(container) {
    container.innerHTML = `
      <div class="admin-page-header">
        <h1>Dashboard</h1>
        <p class="admin-subtitle">Panel administrativo — <span class="badge-demo-inline">Datos de demostración</span></p>
      </div>

      <div class="admin-stats-grid">
        <div class="stat-card">
          <div class="stat-icon stat-icon--blue">📰</div>
          <div class="stat-info">
            <div class="stat-value">6</div>
            <div class="stat-label">Publicaciones</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon--green">✅</div>
          <div class="stat-info">
            <div class="stat-value">5</div>
            <div class="stat-label">Trámites registrados</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon--orange">👥</div>
          <div class="stat-info">
            <div class="stat-value">5</div>
            <div class="stat-label">Autoridades</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon--gray">📬</div>
          <div class="stat-info">
            <div class="stat-value">—</div>
            <div class="stat-label">Mensajes (demo)</div>
          </div>
        </div>
      </div>

      <div class="aviso-demo" style="margin:1.5rem 0;">
        <strong>⚠️ Panel de demostración</strong><br>
        Todos los valores mostrados son datos de ejemplo. El sistema real requerirá un backend con base de datos, autenticación segura y roles de usuario.
      </div>

      <div class="admin-grid-2col">
        <section class="admin-card">
          <h2>Últimas publicaciones</h2>
          <table class="admin-table">
            <thead><tr><th>Título</th><th>Estado</th><th>Fecha</th></tr></thead>
            <tbody>
              ${(PELECHUCO_DATA?.noticias || []).slice(0, 5).map(n => `
                <tr>
                  <td><button class="link-btn" onclick="Admin.navegar('editar-noticia', ${n.id})">${n.titulo}</button></td>
                  <td><span class="badge badge--${n.estado}">${n.estado}</span></td>
                  <td>${n.fecha}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </section>

        <section class="admin-card">
          <h2>Acciones rápidas</h2>
          <div class="acciones-rapidas">
            <button class="accion-btn" onclick="Admin.navegar('nueva-noticia')">
              <span class="accion-icon">✏️</span> Nueva publicación
            </button>
            <button class="accion-btn" onclick="Admin.navegar('autoridades')">
              <span class="accion-icon">👤</span> Gestionar autoridades
            </button>
            <button class="accion-btn" onclick="Admin.navegar('tramites')">
              <span class="accion-icon">📋</span> Gestionar trámites
            </button>
            <button class="accion-btn" onclick="Admin.navegar('contacto')">
              <span class="accion-icon">📞</span> Datos de contacto
            </button>
          </div>
        </section>
      </div>
    `;
  },

  // =========== NOTICIAS ===========
  renderNoticias(container) {
    container.innerHTML = `
      <div class="admin-page-header">
        <h1>Noticias y Comunicados</h1>
        <button class="btn-primary" onclick="Admin.navegar('nueva-noticia')">+ Nueva publicación</button>
      </div>
      <div class="aviso-demo">⚠️ Tabla de demostración — Las acciones no guardan datos reales</div>
      <div class="admin-card">
        <div class="admin-toolbar">
          <input type="search" placeholder="Buscar publicación..." class="admin-input" aria-label="Buscar publicación">
          <select class="admin-select" aria-label="Filtrar por estado">
            <option>Todos los estados</option>
            <option>publicado</option>
            <option>borrador</option>
            <option>despublicado</option>
          </select>
        </div>
        <table class="admin-table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Categoría</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${(PELECHUCO_DATA?.noticias || []).map(n => `
              <tr>
                <td>${n.titulo}</td>
                <td>${n.categoria}</td>
                <td><span class="badge badge--${n.estado}">${n.estado}</span></td>
                <td>${n.fecha}</td>
                <td class="acciones-tabla">
                  <button class="btn-sm btn-sm--edit" onclick="Admin.navegar('editar-noticia', ${n.id})">Editar</button>
                  <button class="btn-sm btn-sm--danger" onclick="Admin.confirmarDespublicar(${n.id})">Despublicar</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  // =========== FORMULARIO NOTICIA ===========
  renderFormNoticia(container) {
    const esEdicion = this.seccionActiva === 'editar-noticia';
    const noticia = esEdicion && this.noticiaEditando
      ? (PELECHUCO_DATA?.noticias || []).find(n => n.id == this.noticiaEditando)
      : null;

    container.innerHTML = `
      <div class="admin-page-header">
        <h1>${esEdicion ? 'Editar publicación' : 'Nueva publicación'}</h1>
        <button class="btn-secondary" onclick="Admin.navegar('noticias')">← Volver a la lista</button>
      </div>
      <div class="aviso-demo">⚠️ Formulario de demostración — Los datos no se guardan</div>
      <form class="admin-form" onsubmit="Admin.simularGuardar(event)">
        <div class="form-group">
          <label for="noticia-titulo">Título de la publicación <span class="required">*</span></label>
          <input id="noticia-titulo" type="text" class="admin-input" required
            value="${noticia?.titulo || ''}" 
            placeholder="Ingrese el título del comunicado">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="noticia-categoria">Categoría <span class="required">*</span></label>
            <select id="noticia-categoria" class="admin-select" required>
              ${(PELECHUCO_DATA?.categorias || []).filter(c => c !== 'Todos').map(c => 
                `<option ${noticia?.categoria === c ? 'selected' : ''}>${c}</option>`
              ).join('')}
            </select>
          </div>
          <div class="form-group">
            <label for="noticia-estado">Estado <span class="required">*</span></label>
            <select id="noticia-estado" class="admin-select" required>
              <option ${noticia?.estado === 'borrador' ? 'selected' : ''}>borrador</option>
              <option ${noticia?.estado === 'publicado' ? 'selected' : ''}>publicado</option>
              <option ${noticia?.estado === 'despublicado' ? 'selected' : ''}>despublicado</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label for="noticia-resumen">Resumen <span class="required">*</span></label>
          <textarea id="noticia-resumen" class="admin-textarea" required rows="3"
            placeholder="Resumen breve del comunicado">${noticia?.resumen || ''}</textarea>
        </div>
        <div class="form-group">
          <label for="noticia-contenido">Contenido completo</label>
          <textarea id="noticia-contenido" class="admin-textarea" rows="8"
            placeholder="[El editor de contenido completo estará disponible en el sistema definitivo]"></textarea>
        </div>
        <div class="form-group">
          <label for="noticia-imagen">URL de imagen (opcional)</label>
          <input id="noticia-imagen" type="url" class="admin-input"
            value="${noticia?.imagen || ''}"
            placeholder="https://ejemplo.com/imagen.jpg">
          <small class="form-help">En el sistema definitivo se podrán subir archivos de imagen directamente.</small>
        </div>
        <div class="form-group">
          <label>Adjuntos PDF (demo)</label>
          <div class="upload-area">
            <button type="button" class="btn-secondary" onclick="App.demoAction('La subida de archivos estará disponible en el sistema con backend')">
              📎 Adjuntar documento PDF
            </button>
            <small class="form-help">Disponible en el sistema definitivo.</small>
          </div>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn-primary">💾 Guardar publicación (demo)</button>
          <button type="button" class="btn-secondary" onclick="Admin.navegar('noticias')">Cancelar</button>
        </div>
      </form>
    `;
  },

  // =========== AUTORIDADES ===========
  renderAutoridades(container) {
    container.innerHTML = `
      <div class="admin-page-header">
        <h1>Gestión de Autoridades</h1>
        <button class="btn-primary" onclick="App.demoAction('El formulario de nueva autoridad estará disponible en el sistema definitivo')">+ Nueva autoridad</button>
      </div>
      <div class="aviso-demo">⚠️ Demostración — No se pueden añadir autoridades reales sin validación institucional</div>
      <div class="admin-grid-autoridades">
        ${(PELECHUCO_DATA?.autoridades || []).map(a => `
          <div class="admin-card autoridad-card">
            <div class="autoridad-foto-placeholder">👤<br><small>[Foto pendiente]</small></div>
            <div class="autoridad-datos">
              <h3>${a.nombre}</h3>
              <p class="autoridad-cargo">${a.cargo}</p>
              <p class="autoridad-area">${a.area}</p>
              <p class="autoridad-contacto">${a.contactoInstitucional}</p>
            </div>
            <div class="acciones-tabla">
              <button class="btn-sm btn-sm--edit" onclick="App.demoAction('Edición de autoridades disponible en el sistema definitivo')">Editar</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  // =========== TRÁMITES ===========
  renderTramites(container) {
    container.innerHTML = `
      <div class="admin-page-header">
        <h1>Gestión de Trámites</h1>
        <button class="btn-primary" onclick="App.demoAction('El formulario de nuevo trámite estará disponible en el sistema definitivo')">+ Nuevo trámite</button>
      </div>
      <div class="aviso-demo">⚠️ Demostración — Los trámites deben ser validados por la alcaldía antes de publicarse</div>
      <div class="admin-card">
        <table class="admin-table">
          <thead>
            <tr><th>Nombre del trámite</th><th>Categoría</th><th>Oficina</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            ${(PELECHUCO_DATA?.tramites || []).map(t => `
              <tr>
                <td>${t.nombre}</td>
                <td>${t.categoria}</td>
                <td>${t.oficina}</td>
                <td class="acciones-tabla">
                  <button class="btn-sm btn-sm--edit" onclick="App.demoAction('Edición de trámites disponible en el sistema definitivo')">Editar</button>
                  <button class="btn-sm btn-sm--danger" onclick="Admin.confirmarDespublicar('tramite')">Eliminar</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  // =========== INSTITUCIÓN ===========
  renderInstitucion(container) {
    container.innerHTML = `
      <div class="admin-page-header">
        <h1>Información Institucional</h1>
      </div>
      <div class="aviso-demo">⚠️ Formulario de demostración — Los cambios no se guardan</div>
      <form class="admin-form" onsubmit="Admin.simularGuardar(event)">
        <div class="form-group">
          <label for="inst-nombre">Nombre oficial de la institución</label>
          <input id="inst-nombre" type="text" class="admin-input" value="Gobierno Autónomo Municipal de Pelechuco">
        </div>
        <div class="form-group">
          <label for="inst-eslogan">Eslogan institucional</label>
          <input id="inst-eslogan" type="text" class="admin-input" value="[Añadir eslogan oficial de la institución]">
        </div>
        <div class="form-group">
          <label for="inst-descripcion">Descripción general del municipio</label>
          <textarea id="inst-descripcion" class="admin-textarea" rows="5" placeholder="[Añadir descripción oficial validada por la alcaldía]"></textarea>
        </div>
        <div class="form-group">
          <label for="inst-logo">Logotipo institucional</label>
          <div class="upload-area">
            <button type="button" class="btn-secondary" onclick="App.demoAction('La subida del logotipo oficial estará disponible en el sistema definitivo')">
              🖼️ Subir logotipo (demo)
            </button>
            <small class="form-help">Formatos: SVG, PNG. El logotipo debe ser la versión oficial autorizada.</small>
          </div>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn-primary">💾 Guardar cambios (demo)</button>
        </div>
      </form>
    `;
  },

  // =========== CONTACTO ===========
  renderContacto(container) {
    container.innerHTML = `
      <div class="admin-page-header">
        <h1>Datos de Contacto</h1>
      </div>
      <div class="aviso-demo">⚠️ Formulario de demostración — Los cambios no se guardan</div>
      <form class="admin-form" onsubmit="Admin.simularGuardar(event)">
        <div class="form-row">
          <div class="form-group">
            <label for="ct-direccion">Dirección institucional</label>
            <input id="ct-direccion" type="text" class="admin-input" placeholder="[Añadir dirección oficial]">
          </div>
          <div class="form-group">
            <label for="ct-telefono">Teléfono institucional</label>
            <input id="ct-telefono" type="tel" class="admin-input" placeholder="[Añadir teléfono oficial]">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="ct-correo">Correo institucional</label>
            <input id="ct-correo" type="email" class="admin-input" placeholder="[Añadir correo oficial]">
          </div>
          <div class="form-group">
            <label for="ct-horario">Horario de atención</label>
            <input id="ct-horario" type="text" class="admin-input" placeholder="[Añadir horario oficial]">
          </div>
        </div>
        <div class="form-group">
          <label for="ct-facebook">Facebook (si se confirma)</label>
          <input id="ct-facebook" type="url" class="admin-input" placeholder="[URL del canal oficial — pendiente de confirmación]">
        </div>
        <div class="form-group">
          <label for="ct-youtube">YouTube (si se confirma)</label>
          <input id="ct-youtube" type="url" class="admin-input" placeholder="[URL del canal oficial — pendiente de confirmación]">
        </div>
        <div class="form-actions">
          <button type="submit" class="btn-primary">💾 Guardar cambios (demo)</button>
        </div>
      </form>
    `;
  },

  // =========== AJUSTES ===========
  renderAjustes(container) {
    container.innerHTML = `
      <div class="admin-page-header">
        <h1>Ajustes Generales</h1>
      </div>
      <div class="aviso-demo">⚠️ Vista conceptual — Los ajustes reales requerirán un sistema backend</div>
      <div class="admin-card">
        <h2>Apariencia del portal</h2>
        <p style="color:var(--admin-text-muted)">El sistema definitivo permitirá personalizar colores, logotipo y otros parámetros visuales del portal institucional.</p>
        <div class="form-group" style="margin-top:1rem;">
          <label>Propuesta visual activa (solo demo)</label>
          <select class="admin-select">
            <option>01 — Andes Institucional</option>
            <option>02 — Territorio y Naturaleza</option>
            <option>03 — Gobierno Abierto</option>
            <option>04 — Pelechuco Contemporáneo</option>
            <option>05 — Comunidad y Servicio</option>
          </select>
        </div>
      </div>
      <div class="admin-card" style="margin-top:1rem;">
        <h2>Sistema y mantenimiento</h2>
        <p style="color:var(--admin-text-muted)">Las funciones de respaldo, exportación e importación de contenido estarán disponibles en el sistema definitivo con infraestructura backend.</p>
        <div style="margin-top:1rem;">
          <button class="btn-secondary" onclick="App.demoAction('Esta función estará disponible en el sistema definitivo')">📦 Exportar contenido (demo)</button>
        </div>
      </div>
    `;
  },

  // =========== UTILIDADES ===========
  simularGuardar(event) {
    event.preventDefault();
    App.notify('✅ Demostración: En el sistema definitivo, los cambios se guardarían en la base de datos.', 'success');
  },

  confirmarDespublicar(id) {
    App.openModal('Confirmar acción', `
      <p>Esta es una demostración visual. En el sistema definitivo, esta acción despublicaría el contenido seleccionado.</p>
      <div style="display:flex;gap:1rem;margin-top:1.5rem;">
        <button class="btn-primary" onclick="App.notify('Demostración: Acción registrada', 'success'); document.querySelector('.modal-overlay').remove();">Confirmar (demo)</button>
        <button class="btn-secondary" onclick="document.querySelector('.modal-overlay').remove()">Cancelar</button>
      </div>
    `);
  },
};

// Inicializar el panel administrativo
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('admin-main')) {
    Admin.init();
  }
});
