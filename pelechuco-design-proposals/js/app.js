/**
 * PELECHUCO DIGITAL — Navegación global y gestión de estado
 * Maneja el cambio entre propuestas y la navegación principal
 */

const App = {
  propuestaActual: null,
  propuestas: [
    { id: '01', nombre: 'Andes Institucional', archivo: 'proposals/01-andes-institucional.html' },
    { id: '02', nombre: 'Territorio y Naturaleza', archivo: 'proposals/02-territorio-naturaleza.html' },
    { id: '03', nombre: 'Gobierno Abierto', archivo: 'proposals/03-gobierno-abierto.html' },
    { id: '04', nombre: 'Pelechuco Contemporáneo', archivo: 'proposals/04-pelechuco-contemporaneo.html' },
    { id: '05', nombre: 'Comunidad y Servicio', archivo: 'proposals/05-comunidad-servicio.html' },
    { id: '06', nombre: 'Ciudad Viva (lapaz.bo)', archivo: 'proposals/06-metropoli-ciudad-viva.html' },
    { id: '07', nombre: 'Andes Neo-Digital', archivo: 'proposals/07-andes-neo-digital.html' },
    { id: '08', nombre: 'Territorio Cálido & Raíces', archivo: 'proposals/08-territorio-calido.html' },
  ],

  init() {
    // Leer propuesta desde URL o sessionStorage
    const params = new URLSearchParams(window.location.search);
    const propId = params.get('propuesta') || sessionStorage.getItem('propuestaActual');
    if (propId) {
      this.propuestaActual = propId;
      this.renderSwitcher();
    }
    this.initMobileMenu();
    this.initScrollEffects();
    this.initRevealOnScroll();
    this.updateYear();
  },

  initRevealOnScroll() {
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.06, rootMargin: '0px 0px -20px 0px' });

    // Aplicar a secciones, tarjetas y bloques interactivos
    setTimeout(() => {
      document.querySelectorAll('section, .noticia-card, .tramite-card, .proposal-card, .p06-vert-card, .p06-bento-card, .p02-autoridad-card, .p04-autoridad-card, .p05-autoridad-card, .p07-card, .p08-step-box').forEach(el => {
        el.classList.add('fade-scroll-init');
        observer.observe(el);
      });
    }, 100);
  },

  renderSwitcher() {
    const switcher = document.getElementById('proposal-switcher');
    if (!switcher) return;
    switcher.innerHTML = '';

    // Detectar si estamos navegando dentro del directorio /proposals/
    const isInProposals = window.location.pathname.includes('/proposals/') || 
                          window.location.href.includes('/proposals/');

    this.propuestas.forEach(p => {
      const btn = document.createElement('a');
      const filename = p.archivo.split('/').pop();
      btn.href = isInProposals 
        ? `${filename}?propuesta=${p.id}` 
        : `${p.archivo}?propuesta=${p.id}`;
      btn.textContent = `${p.id}`;
      btn.title = p.nombre;
      btn.className = 'switcher-btn' + (p.id === this.propuestaActual ? ' active' : '');
      btn.setAttribute('aria-label', `Propuesta ${p.id}: ${p.nombre}`);
      switcher.appendChild(btn);
    });
  },

  initMobileMenu() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (!menuBtn || !mobileMenu) return;

    menuBtn.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', isOpen);
      menuBtn.querySelector('.menu-icon-open')?.classList.toggle('hidden', isOpen);
      menuBtn.querySelector('.menu-icon-close')?.classList.toggle('hidden', !isOpen);
    });

    // Cerrar al hacer clic en enlace
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });

    // Cerrar al hacer clic fuera
    document.addEventListener('click', (e) => {
      if (!menuBtn.contains(e.target) && !mobileMenu.contains(e.target)) {
        mobileMenu.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
      }
    });
  },

  initScrollEffects() {
    const header = document.getElementById('site-header');
    if (!header) return;
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
      const current = window.scrollY;
      header.classList.toggle('scrolled', current > 50);
      lastScroll = current;
    }, { passive: true });
  },

  updateYear() {
    document.querySelectorAll('[data-year]').forEach(el => {
      el.textContent = new Date().getFullYear();
    });
  },

  // Navegación a sección
  scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  },

  // Guardar propuesta activa
  setPropuesta(id) {
    this.propuestaActual = id;
    sessionStorage.setItem('propuestaActual', id);
  },

  // Mostrar notificación temporal
  notify(mensaje, tipo = 'info') {
    const existing = document.getElementById('app-notification');
    if (existing) existing.remove();

    const notif = document.createElement('div');
    notif.id = 'app-notification';
    notif.setAttribute('role', 'alert');
    notif.setAttribute('aria-live', 'polite');
    notif.className = `app-notification app-notification--${tipo}`;
    notif.innerHTML = `
      <span>${mensaje}</span>
      <button onclick="this.parentElement.remove()" aria-label="Cerrar notificación">&times;</button>
    `;
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 4000);
  },

  // Modal genérico
  openModal(title, content) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'modal-title');
    overlay.innerHTML = `
      <div class="modal-box">
        <div class="modal-header">
          <h2 id="modal-title">${title}</h2>
          <button class="modal-close" aria-label="Cerrar">&times;</button>
        </div>
        <div class="modal-body">${content}</div>
      </div>
    `;
    overlay.querySelector('.modal-close').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    document.body.appendChild(overlay);
    overlay.querySelector('.modal-close').focus();

    // Cerrar con Escape
    const escHandler = (e) => { if (e.key === 'Escape') { overlay.remove(); document.removeEventListener('keydown', escHandler); } };
    document.addEventListener('keydown', escHandler);
  },

  // Detectar demo action
  demoAction(mensaje) {
    App.notify(`⚠️ Demostración visual: ${mensaje}`, 'demo');
  }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => App.init());
