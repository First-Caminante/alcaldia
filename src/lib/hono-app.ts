import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { supabase, isSupabaseConfigured, getSupabaseAdmin, getAuthenticatedSupabaseClient } from './supabase';
import { uploadToSupabaseStorage, deleteFromSupabaseStorage, syncStorageWithDatabase, STORAGE_CONFIG, type StorageFolder } from './storage';
import {
  getDefaultPortalData,
  DEFAULT_NOTICIAS,
  DEFAULT_TRAMITES,
  DEFAULT_CATEGORIAS_NOTICIAS,
  DEFAULT_TRAMITES_CATEGORIAS,
} from './data-defaults';

const app = new Hono().basePath('/api');

// Middleware
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Helper para extraer token de Authorization header
function getAuthToken(c: any): string | null {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. ESTADO DEL SISTEMA Y SALUD
// ─────────────────────────────────────────────────────────────────────────────
app.get('/status', async (c) => {
  const configured = isSupabaseConfigured();
  let dbHealthy = false;
  let dbError = null;

  if (configured) {
    try {
      const { data, error } = await supabase.from('contacto_config').select('id').limit(1);
      if (!error) {
        dbHealthy = true;
      } else {
        dbError = error.message;
      }
    } catch (err: any) {
      dbError = err?.message || 'Error de conexión';
    }
  }

  return c.json({
    status: 'online',
    municipio: 'Gobierno Autónomo Municipal de Pelechuco',
    frameworks: {
      frontend: 'Astro',
      backend: 'Hono',
      database: 'Supabase PostgreSQL',
      storage: 'Supabase Storage'
    },
    supabase: {
      configured,
      connected: dbHealthy,
      error: dbError,
    },
    timestamp: new Date().toISOString(),
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. PORTAL PÚBLICO AGREGADO (SSG / SSR)
// ─────────────────────────────────────────────────────────────────────────────
app.get('/portal', async (c) => {
  if (!isSupabaseConfigured()) {
    return c.json({ source: 'defaults', data: getDefaultPortalData() });
  }

  try {
    // Intentar consultar la vista agregada optimizada
    const { data: viewData, error: viewError } = await supabase
      .from('v_portal_publico')
      .select('*')
      .single();

    if (!viewError && viewData) {
      return c.json({ source: 'database_view', data: viewData });
    }

    // Fallback: consultas paralelas por si la vista no estuviera creada aún
    const [heroRes, introRes, seccionesRes, galeriaRes, autRes, tramCatRes, tramRes, contRes, redesRes] =
      await Promise.all([
        supabase.from('hero_section').select('*').eq('is_active', true).single(),
        supabase.from('conoce_intro').select('*').single(),
        supabase.from('conoce_secciones').select('*').eq('is_active', true).order('display_order'),
        supabase.from('galeria_imagenes').select('*').eq('is_active', true).order('display_order'),
        supabase.from('autoridades').select('*').eq('is_active', true).order('display_order'),
        supabase.from('tramites_categorias').select('*').eq('is_active', true).order('display_order'),
        supabase.from('tramites').select('*').eq('is_active', true).order('display_order'),
        supabase.from('contacto_config').select('*').single(),
        supabase.from('redes_sociales').select('*').eq('is_active', true).order('display_order'),
      ]);

    const tramitesCategorizados = (tramCatRes.data || []).map((cat) => ({
      ...cat,
      tramites: (tramRes.data || []).filter((t) => t.category_id === cat.id),
    }));

    const result = {
      hero: heroRes.data || getDefaultPortalData().hero,
      conoce_intro: introRes.data || getDefaultPortalData().conoce_intro,
      conoce_secciones: seccionesRes.data?.length ? seccionesRes.data : getDefaultPortalData().conoce_secciones,
      galeria: galeriaRes.data?.length ? galeriaRes.data : getDefaultPortalData().galeria,
      autoridades: autRes.data?.length ? autRes.data : getDefaultPortalData().autoridades,
      tramites_categorias: tramitesCategorizados.length ? tramitesCategorizados : getDefaultPortalData().tramites_categorias,
      contacto: contRes.data || getDefaultPortalData().contacto,
      redes_sociales: redesRes.data?.length ? redesRes.data : getDefaultPortalData().redes_sociales,
    };

    return c.json({ source: 'database', data: result });
  } catch (error: any) {
    console.error('Error al consultar portal en Supabase:', error);
    return c.json({ source: 'defaults_fallback', data: getDefaultPortalData() });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. NOTICIAS Y COMUNICADOS
// ─────────────────────────────────────────────────────────────────────────────
app.get('/noticias', async (c) => {
  const categoriaSlug = c.req.query('categoria');
  const busqueda = c.req.query('q')?.toLowerCase();
  const limit = Number(c.req.query('limit')) || 20;

  if (!isSupabaseConfigured()) {
    let list = [...DEFAULT_NOTICIAS];
    if (categoriaSlug && categoriaSlug !== 'todos') {
      const cat = DEFAULT_CATEGORIAS_NOTICIAS.find((ct) => ct.slug === categoriaSlug);
      if (cat) list = list.filter((n) => n.category_id === cat.id);
    }
    if (busqueda) {
      list = list.filter(
        (n) => n.title.toLowerCase().includes(busqueda) || n.summary.toLowerCase().includes(busqueda)
      );
    }
    return c.json({
      source: 'defaults',
      categorias: DEFAULT_CATEGORIAS_NOTICIAS,
      noticias: list.slice(0, limit),
      total: list.length,
    });
  }

  try {
    let query = supabase
      .from('noticias')
      .select('*, category:noticias_categorias(*)')
      .eq('status', 'publicado')
      .order('published_at', { ascending: false })
      .limit(limit);

    if (categoriaSlug && categoriaSlug !== 'todos') {
      const { data: catData } = await supabase
        .from('noticias_categorias')
        .select('id')
        .eq('slug', categoriaSlug)
        .single();
      if (catData) {
        query = query.eq('category_id', catData.id);
      }
    }

    if (busqueda) {
      query = query.or(`title.ilike.%${busqueda}%,summary.ilike.%${busqueda}%`);
    }

    const [noticiasRes, catRes] = await Promise.all([
      query,
      supabase.from('noticias_categorias').select('*').eq('is_active', true).order('display_order'),
    ]);

    return c.json({
      source: 'database',
      categorias: catRes.data || DEFAULT_CATEGORIAS_NOTICIAS,
      noticias: noticiasRes.data || [],
      total: noticiasRes.data?.length || 0,
    });
  } catch (error: any) {
    return c.json({ source: 'error_fallback', error: error.message, noticias: DEFAULT_NOTICIAS });
  }
});

app.get('/noticias/:slug', async (c) => {
  const slug = c.req.param('slug');

  if (!isSupabaseConfigured()) {
    const noticia = DEFAULT_NOTICIAS.find((n) => n.slug === slug);
    if (!noticia) return c.json({ error: 'Noticia no encontrada' }, 404);
    return c.json({ source: 'defaults', noticia });
  }

  try {
    const { data, error } = await supabase
      .from('noticias')
      .select('*, category:noticias_categorias(*), adjuntos:noticias_adjuntos(*)')
      .eq('slug', slug)
      .eq('status', 'publicado')
      .single();

    if (error || !data) {
      return c.json({ error: 'Noticia no encontrada' }, 404);
    }

    // Incrementar contador de visitas asíncronamente
    supabase.rpc('increment_noticia_views', { noticia_id: data.id }).then().catch(() => {});

    return c.json({ source: 'database', noticia: data });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. TRÁMITES Y SERVICIOS CIUDADANOS
// ─────────────────────────────────────────────────────────────────────────────
app.get('/tramites', async (c) => {
  const categoriaSlug = c.req.query('categoria');
  const busqueda = c.req.query('q')?.toLowerCase();

  if (!isSupabaseConfigured()) {
    let list = [...DEFAULT_TRAMITES];
    if (categoriaSlug && categoriaSlug !== 'todos') {
      const cat = DEFAULT_TRAMITES_CATEGORIAS.find((ct) => ct.slug === categoriaSlug);
      if (cat) list = list.filter((t) => t.category_id === cat.id);
    }
    if (busqueda) {
      list = list.filter(
        (t) => t.title.toLowerCase().includes(busqueda) || t.description.toLowerCase().includes(busqueda)
      );
    }
    return c.json({
      source: 'defaults',
      categorias: DEFAULT_TRAMITES_CATEGORIAS,
      tramites: list,
    });
  }

  try {
    const [catRes, tramRes] = await Promise.all([
      supabase.from('tramites_categorias').select('*').eq('is_active', true).order('display_order'),
      supabase.from('tramites').select('*, archivos:tramites_archivos(*)').eq('is_active', true).order('display_order'),
    ]);

    let tramites = tramRes.data || [];
    if (categoriaSlug && categoriaSlug !== 'todos') {
      const matchedCat = catRes.data?.find((c) => c.slug === categoriaSlug);
      if (matchedCat) {
        tramites = tramites.filter((t) => t.category_id === matchedCat.id);
      }
    }

    if (busqueda) {
      tramites = tramites.filter(
        (t) => t.title.toLowerCase().includes(busqueda) || t.description.toLowerCase().includes(busqueda)
      );
    }

    return c.json({
      source: 'database',
      categorias: catRes.data || [],
      tramites,
    });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

app.get('/tramites/:slug', async (c) => {
  const slug = c.req.param('slug');

  if (!isSupabaseConfigured()) {
    const tramite = DEFAULT_TRAMITES.find((t) => t.slug === slug);
    if (!tramite) return c.json({ error: 'Trámite no encontrado' }, 404);
    return c.json({ source: 'defaults', tramite });
  }

  try {
    const { data, error } = await supabase
      .from('tramites')
      .select('*, categoria:tramites_categorias(*), archivos:tramites_archivos(*)')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return c.json({ error: 'Trámite no encontrado' }, 404);
    }

    return c.json({ source: 'database', tramite: data });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. BUZÓN CIUDADANO Y CONTACTO
// ─────────────────────────────────────────────────────────────────────────────
app.post('/contacto', async (c) => {
  try {
    const body = await c.req.json();
    const { full_name, email, phone, subject, message } = body;

    if (!full_name || !email || !subject || !message) {
      return c.json({ error: 'Todos los campos obligatorios deben ser completados.' }, 400);
    }

    // Validación básica de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return c.json({ error: 'El correo electrónico proporcionado no es válido.' }, 400);
    }

    if (!isSupabaseConfigured()) {
      return c.json({
        success: true,
        message: 'Mensaje recibido exitosamente (Modo demostración). Gracias por comunicarse con el GAM Pelechuco.',
        data: { full_name, email, subject },
      });
    }

    const client = getSupabaseAdmin() || supabase;
    const { error } = await client.from('mensajes_contacto').insert([
      {
        full_name,
        email,
        phone: phone || null,
        subject,
        message,
      },
    ]);

    if (error) {
      console.error('Error al registrar mensaje:', error);
      return c.json({ error: 'No se pudo enviar el mensaje. Intente más tarde.' }, 500);
    }

    return c.json({
      success: true,
      message: 'Su mensaje ha sido enviado correctamente a la secretaría del GAM Pelechuco.',
    });
  } catch (err: any) {
    return c.json({ error: err.message || 'Error procesando solicitud.' }, 500);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. AUTENTICACIÓN ADMINISTRATIVA (SUPABASE AUTH)
// ─────────────────────────────────────────────────────────────────────────────
app.post('/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: 'Debe ingresar correo y contraseña.' }, 400);
    }

    if (!isSupabaseConfigured()) {
      // Modo demo de prueba cuando aún no están configuradas las credenciales
      if (email === 'admin@pelechuco.gob.bo' && password === 'pelechuco2026') {
        return c.json({
          success: true,
          demoMode: true,
          session: {
            access_token: 'demo-token-gam-pelechuco',
            user: {
              id: 'demo-admin-id',
              email: 'admin@pelechuco.gob.bo',
              user_metadata: { full_name: 'Administrador Municipal GAM' },
            },
          },
        });
      }
      return c.json({
        error: 'Las credenciales de Supabase aún no están configuradas en el entorno. Para probar el modo demo usa admin@pelechuco.gob.bo / pelechuco2026.',
      }, 401);
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      return c.json({ error: error?.message || 'Credenciales incorrectas' }, 401);
    }

    // Verificar si el usuario figura como administrador activo en public.admin_users
    const { data: adminUser, error: adminErr } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', data.user.id)
      .eq('is_active', true)
      .single();

    if (adminErr || !adminUser) {
      return c.json({ error: 'El usuario no tiene privilegios de administrador activo.' }, 403);
    }

    // Actualizar último inicio de sesión
    await supabase
      .from('admin_users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', data.user.id);

    return c.json({
      success: true,
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
        user: {
          id: data.user.id,
          email: data.user.email,
          full_name: adminUser.full_name,
        },
      },
    });
  } catch (err: any) {
    return c.json({ error: err.message || 'Error en el servidor de autenticación' }, 500);
  }
});

// Verificación de sesión de administrador
app.get('/auth/me', async (c) => {
  const token = getAuthToken(c);
  if (!token) {
    return c.json({ authenticated: false, error: 'Token no proporcionado' }, 401);
  }

  if (token === 'demo-token-gam-pelechuco') {
    return c.json({
      authenticated: true,
      demoMode: true,
      user: {
        id: 'demo-admin-id',
        email: 'admin@pelechuco.gob.bo',
        full_name: 'Administrador Municipal GAM (Demo)',
      },
    });
  }

  if (!isSupabaseConfigured()) {
    return c.json({ authenticated: false, error: 'Supabase no configurado' }, 500);
  }

  try {
    const authClient = getAuthenticatedSupabaseClient(token);
    const { data: { user }, error } = await authClient.auth.getUser();

    if (error || !user) {
      return c.json({ authenticated: false, error: 'Sesión inválida o expirada' }, 401);
    }

    const { data: adminRecord } = await authClient
      .from('admin_users')
      .select('*')
      .eq('id', user.id)
      .eq('is_active', true)
      .single();

    if (!adminRecord) {
      return c.json({ authenticated: false, error: 'Usuario no es administrador' }, 403);
    }

    return c.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        full_name: adminRecord.full_name,
        avatar_url: adminRecord.avatar_url,
      },
    });
  } catch (err: any) {
    return c.json({ authenticated: false, error: err.message }, 500);
  }
});

// Helper para convertir títulos en slugs limpios
function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Helper para validar autenticación de administrador
async function verifyAdmin(c: any): Promise<boolean> {
  const token = getAuthToken(c);
  if (!token) return false;
  if (token === 'demo-token-gam-pelechuco') return true;

  const adminClient = getSupabaseAdmin();
  if (!adminClient) return false;

  try {
    const { data: { user }, error } = await adminClient.auth.getUser(token);
    if (error || !user) return false;

    const { data } = await adminClient
      .from('admin_users')
      .select('id')
      .eq('id', user.id)
      .eq('is_active', true)
      .single();

    return Boolean(data);
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. OPERACIONES CRUD ADMINISTRATIVAS (PROTEGIDAS)
// ─────────────────────────────────────────────────────────────────────────────

// NOTICIAS: Crear, Editar, Eliminar
app.post('/admin/noticias', async (c) => {
  if (!(await verifyAdmin(c))) return c.json({ error: 'No autorizado' }, 401);
  const client = getSupabaseAdmin() || supabase;

  try {
    const body = await c.req.json();
    const { title, summary, content, category_id, featured_image_url, is_featured, status, video_url, gallery_images } = body;

    if (!title || !summary || !content) {
      return c.json({ error: 'Título, resumen y contenido son obligatorios.' }, 400);
    }

    let slug = slugify(title);
    // Asegurar unicidad añadiendo sufijo si es necesario
    const { data: existing } = await client.from('noticias').select('id').eq('slug', slug).maybeSingle();
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const insertPayload: any = {
      title,
      slug,
      summary,
      content,
      category_id: category_id || null,
      featured_image_url: featured_image_url || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80',
      is_featured: Boolean(is_featured),
      status: status || 'publicado',
      published_at: new Date().toISOString()
    };

    if (video_url !== undefined) {
      insertPayload.video_url = video_url && typeof video_url === 'string' ? video_url.trim() : null;
    }
    if (gallery_images !== undefined) {
      insertPayload.gallery_images = Array.isArray(gallery_images) ? gallery_images.filter(Boolean) : [];
    }

    let { data, error } = await client.from('noticias').insert([insertPayload]).select('*, category:noticias_categorias(*)').single();

    // Resiliencia: si las columnas video_url o gallery_images no existen aún en la tabla de Supabase, reintentar sin ellas
    if (error && (error.message?.includes('video_url') || error.message?.includes('gallery_images') || error.message?.includes('column'))) {
      delete insertPayload.video_url;
      delete insertPayload.gallery_images;
      const retry = await client.from('noticias').insert([insertPayload]).select('*, category:noticias_categorias(*)').single();
      data = retry.data;
      error = retry.error;
    }

    if (error) return c.json({ error: error.message }, 500);
    return c.json({ success: true, noticia: data });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

app.put('/admin/noticias/:id', async (c) => {
  if (!(await verifyAdmin(c))) return c.json({ error: 'No autorizado' }, 401);
  const client = getSupabaseAdmin() || supabase;
  const id = c.req.param('id');

  try {
    const body = await c.req.json();
    const { title, summary, content, category_id, featured_image_url, is_featured, status, video_url, gallery_images } = body;

    const updates: any = {};
    if (title !== undefined) updates.title = title;
    if (summary !== undefined) updates.summary = summary;
    if (content !== undefined) updates.content = content;
    if (category_id !== undefined) updates.category_id = category_id || null;
    if (featured_image_url !== undefined) updates.featured_image_url = featured_image_url || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80';
    if (is_featured !== undefined) updates.is_featured = Boolean(is_featured);
    if (status !== undefined) updates.status = status;
    if (video_url !== undefined) {
      updates.video_url = video_url && typeof video_url === 'string' ? video_url.trim() : null;
    }
    if (gallery_images !== undefined) {
      updates.gallery_images = Array.isArray(gallery_images) ? gallery_images.filter(Boolean) : [];
    }
    updates.updated_at = new Date().toISOString();

    let { data, error } = await client
      .from('noticias')
      .update(updates)
      .eq('id', id)
      .select('*, category:noticias_categorias(*)')
      .single();

    // Resiliencia si las columnas no están aún en la BD
    if (error && (error.message?.includes('video_url') || error.message?.includes('gallery_images') || error.message?.includes('column'))) {
      delete updates.video_url;
      delete updates.gallery_images;
      const retry = await client
        .from('noticias')
        .update(updates)
        .eq('id', id)
        .select('*, category:noticias_categorias(*)')
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error) return c.json({ error: error.message }, 500);
    return c.json({ success: true, noticia: data });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

app.delete('/admin/noticias/:id', async (c) => {
  if (!(await verifyAdmin(c))) return c.json({ error: 'No autorizado' }, 401);
  const client = getSupabaseAdmin() || supabase;
  const id = c.req.param('id');

  try {
    const { error } = await client.from('noticias').delete().eq('id', id);
    if (error) return c.json({ error: error.message }, 500);
    return c.json({ success: true, message: 'Noticia eliminada correctamente' });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// TRÁMITES: Crear, Editar, Eliminar
app.post('/admin/tramites', async (c) => {
  if (!(await verifyAdmin(c))) return c.json({ error: 'No autorizado' }, 401);
  const client = getSupabaseAdmin() || supabase;

  try {
    const body = await c.req.json();
    const {
      category_id,
      title,
      description,
      requirements,
      office,
      schedule,
      cost,
      processing_time,
      image_url,
      image_key,
      video_url,
      document_url,
      document_name,
      document_key
    } = body;

    if (!title || !description || !category_id) {
      return c.json({ error: 'Título, categoría y descripción son obligatorios.' }, 400);
    }

    let slug = slugify(title);
    const { data: existing } = await client.from('tramites').select('id').eq('slug', slug).maybeSingle();
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const reqArray = Array.isArray(requirements) ? requirements : (typeof requirements === 'string' ? requirements.split('\n').filter(Boolean) : []);

    const insertPayload: Record<string, any> = {
      category_id,
      title,
      slug,
      description,
      requirements: reqArray,
      office: office || 'Edificio Consistorial Municipal',
      schedule: schedule || 'Lunes a Viernes de 08:30 a 16:30',
      cost: cost || 'Trámite Gratuito',
      processing_time: processing_time || '24 a 48 horas',
      is_active: true
    };

    if (image_url !== undefined) insertPayload.image_url = (image_url && image_url.trim()) || null;
    if (image_key !== undefined) insertPayload.image_key = (image_key && image_key.trim()) || null;
    if (video_url !== undefined) insertPayload.video_url = (video_url && video_url.trim()) || null;
    if (document_url !== undefined) insertPayload.document_url = (document_url && document_url.trim()) || null;
    if (document_name !== undefined) insertPayload.document_name = (document_name && document_name.trim()) || null;
    if (document_key !== undefined) insertPayload.document_key = (document_key && document_key.trim()) || null;

    let { data, error } = await client.from('tramites').insert([insertPayload]).select('*, categoria:tramites_categorias(*)').single();

    // Fallback resiliente si las nuevas columnas aún no existen en Supabase remoto
    if (error && error.message && (error.message.includes('image_url') || error.message.includes('video_url') || error.message.includes('document_url'))) {
      const basicPayload = {
        category_id,
        title,
        slug,
        description,
        requirements: reqArray,
        office: office || 'Edificio Consistorial Municipal',
        schedule: schedule || 'Lunes a Viernes de 08:30 a 16:30',
        cost: cost || 'Trámite Gratuito',
        processing_time: processing_time || '24 a 48 horas',
        is_active: true
      };
      const retry = await client.from('tramites').insert([basicPayload]).select('*, categoria:tramites_categorias(*)').single();
      data = retry.data;
      error = retry.error;
    }

    if (error) return c.json({ error: error.message }, 500);
    return c.json({ success: true, tramite: data });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

app.put('/admin/tramites/:id', async (c) => {
  if (!(await verifyAdmin(c))) return c.json({ error: 'No autorizado' }, 401);
  const client = getSupabaseAdmin() || supabase;
  const id = c.req.param('id');

  try {
    const body = await c.req.json();
    const updates: any = {};
    if (body.title !== undefined) updates.title = body.title;
    if (body.description !== undefined) updates.description = body.description;
    if (body.category_id !== undefined) updates.category_id = body.category_id || null;
    if (body.cost !== undefined) updates.cost = body.cost;
    if (body.office !== undefined) updates.office = body.office;
    if (body.schedule !== undefined) updates.schedule = body.schedule;
    if (body.processing_time !== undefined) updates.processing_time = body.processing_time;
    if (body.requirements !== undefined) {
      updates.requirements = Array.isArray(body.requirements) ? body.requirements : body.requirements.split('\n').filter(Boolean);
    }
    if (body.image_url !== undefined) updates.image_url = (body.image_url && body.image_url.trim()) || null;
    if (body.image_key !== undefined) updates.image_key = (body.image_key && body.image_key.trim()) || null;
    if (body.video_url !== undefined) updates.video_url = (body.video_url && body.video_url.trim()) || null;
    if (body.document_url !== undefined) updates.document_url = (body.document_url && body.document_url.trim()) || null;
    if (body.document_name !== undefined) updates.document_name = (body.document_name && body.document_name.trim()) || null;
    if (body.document_key !== undefined) updates.document_key = (body.document_key && body.document_key.trim()) || null;

    updates.updated_at = new Date().toISOString();

    let { data, error } = await client.from('tramites').update(updates).eq('id', id).select('*, categoria:tramites_categorias(*)').single();

    // Fallback resiliente si las nuevas columnas aún no existen en Supabase remoto
    if (error && error.message && (error.message.includes('image_url') || error.message.includes('video_url') || error.message.includes('document_url'))) {
      const basicUpdates = { ...updates };
      delete basicUpdates.image_url;
      delete basicUpdates.image_key;
      delete basicUpdates.video_url;
      delete basicUpdates.document_url;
      delete basicUpdates.document_name;
      delete basicUpdates.document_key;
      const retry = await client.from('tramites').update(basicUpdates).eq('id', id).select('*, categoria:tramites_categorias(*)').single();
      data = retry.data;
      error = retry.error;
    }

    if (error) return c.json({ error: error.message }, 500);
    return c.json({ success: true, tramite: data });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

app.delete('/admin/tramites/:id', async (c) => {
  if (!(await verifyAdmin(c))) return c.json({ error: 'No autorizado' }, 401);
  const client = getSupabaseAdmin() || supabase;
  const id = c.req.param('id');

  try {
    const { error } = await client.from('tramites').delete().eq('id', id);
    if (error) return c.json({ error: error.message }, 500);
    return c.json({ success: true, message: 'Trámite eliminado correctamente' });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// AUTORIDADES: Crear, Editar, Eliminar
app.post('/admin/autoridades', async (c) => {
  if (!(await verifyAdmin(c))) return c.json({ error: 'No autorizado' }, 401);
  const client = getSupabaseAdmin() || supabase;

  try {
    const body = await c.req.json();
    const { name, position, area, institutional_contact, photo_url } = body;

    if (!name || !position || !area) {
      return c.json({ error: 'Nombre, cargo y área son obligatorios.' }, 400);
    }

    const { data, error } = await client.from('autoridades').insert([{
      name,
      position,
      area,
      institutional_contact: (institutional_contact && institutional_contact.trim()) || null,
      photo_url: (photo_url && photo_url.trim()) || null,
      is_active: true
    }]).select().single();

    if (error) return c.json({ error: error.message }, 500);
    return c.json({ success: true, autoridad: data });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

app.put('/admin/autoridades/:id', async (c) => {
  if (!(await verifyAdmin(c))) return c.json({ error: 'No autorizado' }, 401);
  const client = getSupabaseAdmin() || supabase;
  const id = c.req.param('id');

  try {
    const body = await c.req.json();
    const updates: any = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.position !== undefined) updates.position = body.position;
    if (body.area !== undefined) updates.area = body.area;
    if (body.institutional_contact !== undefined) {
      updates.institutional_contact = (body.institutional_contact && body.institutional_contact.trim()) || null;
    }
    if (body.photo_url !== undefined) {
      updates.photo_url = (body.photo_url && body.photo_url.trim()) || null;
    }
    if (body.is_active !== undefined) updates.is_active = body.is_active;
    updates.updated_at = new Date().toISOString();

    const { data, error } = await client.from('autoridades').update(updates).eq('id', id).select().single();
    if (error) return c.json({ error: error.message }, 500);
    return c.json({ success: true, autoridad: data });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

app.delete('/admin/autoridades/:id', async (c) => {
  if (!(await verifyAdmin(c))) return c.json({ error: 'No autorizado' }, 401);
  const client = getSupabaseAdmin() || supabase;
  const id = c.req.param('id');

  try {
    const { error } = await client.from('autoridades').delete().eq('id', id);
    if (error) return c.json({ error: error.message }, 500);
    return c.json({ success: true, message: 'Autoridad eliminada correctamente' });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// CONFIGURACIÓN: Hero, Conoce, Contacto
app.put('/admin/hero', async (c) => {
  if (!(await verifyAdmin(c))) return c.json({ error: 'No autorizado' }, 401);
  const client = getSupabaseAdmin() || supabase;

  try {
    const body = await c.req.json();
    const { badge_text, title_main, title_highlight, subtitle, bg_image_url } = body;

    const { data, error } = await client.from('hero_section').update({
      badge_text,
      title_main,
      title_highlight,
      subtitle,
      bg_image_url,
      updated_at: new Date().toISOString()
    }).eq('id', 1).select().single();

    if (error) return c.json({ error: error.message }, 500);
    return c.json({ success: true, hero: data });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

app.put('/admin/conoce', async (c) => {
  if (!(await verifyAdmin(c))) return c.json({ error: 'No autorizado' }, 401);
  const client = getSupabaseAdmin() || supabase;

  try {
    const body = await c.req.json();
    const { title, description, altitud, superficie, poblacion, image_url, image_key } = body;

    const updatePayload: Record<string, any> = {
      title,
      description,
      altitud,
      superficie,
      poblacion,
      updated_at: new Date().toISOString()
    };
    if (image_url !== undefined) updatePayload.image_url = image_url;
    if (image_key !== undefined) updatePayload.image_key = image_key;

    let { data, error } = await client.from('conoce_intro').update(updatePayload).eq('id', 1).select().single();

    // Si la fila id=1 no existe aún, realizar upsert
    if (error && (error.code === 'PGRST116' || !data)) {
      const { data: upsertData, error: upsertError } = await client.from('conoce_intro').upsert({ id: 1, ...updatePayload }).select().single();
      data = upsertData;
      error = upsertError;
    }

    if (error) return c.json({ error: error.message }, 500);
    return c.json({ success: true, conoce_intro: data });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

app.put('/admin/contacto', async (c) => {
  if (!(await verifyAdmin(c))) return c.json({ error: 'No autorizado' }, 401);
  const client = getSupabaseAdmin() || supabase;

  try {
    const body = await c.req.json();
    const {
      address_primary,
      address_secondary,
      city_department,
      map_embed_url,
      phone_central,
      phone_whatsapp,
      email_general,
      email_dispatch,
      schedule_weekdays
    } = body;

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString()
    };
    if (address_primary !== undefined) updatePayload.address_primary = address_primary;
    if (address_secondary !== undefined) updatePayload.address_secondary = address_secondary;
    if (city_department !== undefined) updatePayload.city_department = city_department;
    if (map_embed_url !== undefined) updatePayload.map_embed_url = map_embed_url;
    if (phone_central !== undefined) updatePayload.phone_central = phone_central;
    if (phone_whatsapp !== undefined) updatePayload.phone_whatsapp = phone_whatsapp;
    if (email_general !== undefined) updatePayload.email_general = email_general;
    if (email_dispatch !== undefined) updatePayload.email_dispatch = email_dispatch;
    if (schedule_weekdays !== undefined) updatePayload.schedule_weekdays = schedule_weekdays;

    const { data, error } = await client
      .from('contacto_config')
      .update(updatePayload)
      .eq('id', 1)
      .select()
      .single();

    if (error) return c.json({ error: error.message }, 500);
    return c.json({ success: true, contacto: data });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// MENSAJES: Eliminar, Marcar leído
app.delete('/admin/mensajes/:id', async (c) => {
  if (!(await verifyAdmin(c))) return c.json({ error: 'No autorizado' }, 401);
  const client = getSupabaseAdmin() || supabase;
  const id = c.req.param('id');

  try {
    const { error } = await client.from('mensajes_contacto').delete().eq('id', id);
    if (error) return c.json({ error: error.message }, 500);
    return c.json({ success: true, message: 'Mensaje eliminado' });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

app.patch('/admin/mensajes/:id/read', async (c) => {
  if (!(await verifyAdmin(c))) return c.json({ error: 'No autorizado' }, 401);
  const client = getSupabaseAdmin() || supabase;
  const id = c.req.param('id');

  try {
    const { data, error } = await client.from('mensajes_contacto').update({
      is_read: true,
      read_at: new Date().toISOString()
    }).eq('id', id).select().single();

    if (error) return c.json({ error: error.message }, 500);
    return c.json({ success: true, mensaje: data });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 7.1 GALERÍA MUNICIPAL: SUBIR, EDITAR Y ELIMINAR FOTOS
// ─────────────────────────────────────────────────────────────────────────────

app.post('/admin/galeria', async (c) => {
  if (!(await verifyAdmin(c))) return c.json({ error: 'No autorizado' }, 401);
  const client = getSupabaseAdmin() || supabase;

  try {
    const body = await c.req.json();
    const { title, description, image_url, image_key, alt_text, category, display_order, is_active } = body;

    if (!title || !image_url) {
      return c.json({ error: 'Título e imagen son requeridos' }, 400);
    }

    const { data, error } = await client.from('galeria_imagenes').insert([{
      title,
      description: description || null,
      image_url,
      image_key: image_key || null,
      alt_text: alt_text || title,
      category: category || 'paisaje',
      display_order: Number(display_order) || 0,
      is_active: is_active !== false,
    }]).select().single();

    if (error) return c.json({ error: error.message }, 500);
    return c.json({ success: true, item: data });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

app.put('/admin/galeria/:id', async (c) => {
  if (!(await verifyAdmin(c))) return c.json({ error: 'No autorizado' }, 401);
  const client = getSupabaseAdmin() || supabase;
  const id = c.req.param('id');

  try {
    const body = await c.req.json();
    const { title, description, image_url, image_key, alt_text, category, display_order, is_active } = body;

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString()
    };
    if (title !== undefined) updatePayload.title = title;
    if (description !== undefined) updatePayload.description = description;
    if (image_url !== undefined) updatePayload.image_url = image_url;
    if (image_key !== undefined) updatePayload.image_key = image_key;
    if (alt_text !== undefined) updatePayload.alt_text = alt_text;
    if (category !== undefined) updatePayload.category = category;
    if (display_order !== undefined) updatePayload.display_order = Number(display_order);
    if (is_active !== undefined) updatePayload.is_active = is_active;

    const { data, error } = await client
      .from('galeria_imagenes')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) return c.json({ error: error.message }, 500);
    return c.json({ success: true, item: data });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

app.delete('/admin/galeria/:id', async (c) => {
  if (!(await verifyAdmin(c))) return c.json({ error: 'No autorizado' }, 401);
  const client = getSupabaseAdmin() || supabase;
  const id = c.req.param('id');

  try {
    // Si tiene un archivo asociado en el bucket de storage, opcionalmente borrarlo
    const { data: img } = await client.from('galeria_imagenes').select('image_key').eq('id', id).single();
    if (img?.image_key) {
      try {
        await deleteFromSupabaseStorage(img.image_key);
      } catch (stErr) {
        console.warn('Aviso: No se pudo eliminar archivo de storage:', stErr);
      }
    }

    const { error } = await client.from('galeria_imagenes').delete().eq('id', id);
    if (error) return c.json({ error: error.message }, 500);
    return c.json({ success: true, message: 'Fotografía eliminada de la galería' });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 7.2 CULTURA Y COMUNIDADES (CONOCE SECCIONES)
// ─────────────────────────────────────────────────────────────────────────────

app.put('/admin/conoce/cultura', async (c) => {
  if (!(await verifyAdmin(c))) return c.json({ error: 'No autorizado' }, 401);
  const client = getSupabaseAdmin() || supabase;

  try {
    const body = await c.req.json();
    const { title, content, subtitle, image_url, image_key, image_alt } = body;

    // Buscar si existe con slug 'cultura'
    const { data: existing } = await client.from('conoce_secciones').select('id').eq('slug', 'cultura').single();

    let res;
    if (existing?.id) {
      res = await client.from('conoce_secciones').update({
        title: title || 'Cultura y Comunidades',
        content,
        subtitle: subtitle || 'Comunidades originarias, Patrimonio cultural, Textilería de alpaca',
        image_url,
        image_key: image_key || null,
        image_alt: image_alt || title || 'Cultura y Comunidades',
        updated_at: new Date().toISOString()
      }).eq('slug', 'cultura').select().single();
    } else {
      res = await client.from('conoce_secciones').insert([{
        slug: 'cultura',
        title: title || 'Cultura y Comunidades',
        content,
        subtitle: subtitle || 'Comunidades originarias, Patrimonio cultural, Textilería de alpaca',
        image_url,
        image_key: image_key || null,
        image_alt: image_alt || title || 'Cultura y Comunidades',
        display_order: 2,
        is_active: true
      }]).select().single();
    }

    if (res.error) return c.json({ error: res.error.message }, 500);
    return c.json({ success: true, seccion: res.data });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 7.3 REDES SOCIALES INSTITUCIONALES (CRUD)
// ─────────────────────────────────────────────────────────────────────────────

app.post('/admin/redes', async (c) => {
  if (!(await verifyAdmin(c))) return c.json({ error: 'No autorizado' }, 401);
  const client = getSupabaseAdmin() || supabase;

  try {
    const body = await c.req.json();
    const { platform, name, url, handle, icon_name, display_order, is_active } = body;

    if (!name || !url) {
      return c.json({ error: 'Nombre y URL de la red social son obligatorios' }, 400);
    }

    const { data, error } = await client.from('redes_sociales').insert([{
      platform: platform || 'facebook',
      name,
      url,
      handle: handle || null,
      icon_name: icon_name || platform || 'facebook',
      display_order: Number(display_order) || 0,
      is_active: is_active !== false,
    }]).select().single();

    if (error) return c.json({ error: error.message }, 500);
    return c.json({ success: true, red: data });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

app.put('/admin/redes/:id', async (c) => {
  if (!(await verifyAdmin(c))) return c.json({ error: 'No autorizado' }, 401);
  const client = getSupabaseAdmin() || supabase;
  const id = c.req.param('id');

  try {
    const body = await c.req.json();
    const { platform, name, url, handle, icon_name, display_order, is_active } = body;

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString()
    };
    if (platform !== undefined) updatePayload.platform = platform;
    if (name !== undefined) updatePayload.name = name;
    if (url !== undefined) updatePayload.url = url;
    if (handle !== undefined) updatePayload.handle = handle;
    if (icon_name !== undefined) updatePayload.icon_name = icon_name;
    if (display_order !== undefined) updatePayload.display_order = Number(display_order);
    if (is_active !== undefined) updatePayload.is_active = is_active;

    const { data, error } = await client
      .from('redes_sociales')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) return c.json({ error: error.message }, 500);
    return c.json({ success: true, red: data });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

app.delete('/admin/redes/:id', async (c) => {
  if (!(await verifyAdmin(c))) return c.json({ error: 'No autorizado' }, 401);
  const client = getSupabaseAdmin() || supabase;
  const id = c.req.param('id');

  try {
    const { error } = await client.from('redes_sociales').delete().eq('id', id);
    if (error) return c.json({ error: error.message }, 500);
    return c.json({ success: true, message: 'Red social eliminada' });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. SUPABASE STORAGE: SUBIDA Y GESTIÓN DE ARCHIVOS MULTIMEDIA OPTIMIZADOS
// ─────────────────────────────────────────────────────────────────────────────

app.post('/admin/upload', async (c) => {
  if (!(await verifyAdmin(c))) return c.json({ error: 'No autorizado' }, 401);

  if (!isSupabaseConfigured()) {
    return c.json({
      error: 'Supabase no está configurado. Verifique las credenciales de Supabase en el archivo .env'
    }, 400);
  }

  try {
    const formData = await c.req.formData();
    const file = formData.get('file');
    const folder = (formData.get('folder') as StorageFolder) || 'general';

    if (!file || !(file instanceof File)) {
      return c.json({ error: 'Debe seleccionar un archivo válido.' }, 400);
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Subir a Supabase Storage
    const uploadResult = await uploadToSupabaseStorage(
      buffer,
      file.name,
      file.type || 'image/webp',
      folder
    );

    // Registrar en tabla public.r2_media para indexación y catálogo del panel
    const client = getSupabaseAdmin() || supabase;
    try {
      await client.from('r2_media').insert([{
        file_key: uploadResult.fileKey,
        public_url: uploadResult.publicUrl,
        bucket_name: STORAGE_CONFIG.bucketName,
        file_name: uploadResult.fileName,
        mime_type: uploadResult.mimeType,
        file_size_bytes: uploadResult.fileSizeBytes,
        folder: folder
      }]);
    } catch (dbErr) {
      console.warn('Aviso: No se pudo registrar en r2_media:', dbErr);
    }

    return c.json({
      success: true,
      url: uploadResult.publicUrl,
      fileKey: uploadResult.fileKey,
      fileName: uploadResult.fileName,
      fileSizeBytes: uploadResult.fileSizeBytes,
      mimeType: uploadResult.mimeType
    });
  } catch (err: any) {
    return c.json({ error: err.message || 'Error al subir archivo a Supabase Storage' }, 500);
  }
});

app.get('/admin/media', async (c) => {
  if (!(await verifyAdmin(c))) return c.json({ error: 'No autorizado' }, 401);
  const client = getSupabaseAdmin() || supabase;

  try {
    let { data, error } = await client
      .from('r2_media')
      .select('*')
      .order('created_at', { ascending: false });

    // Si la tabla estuviera vacía o con pocos registros, realizamos un escaneo del bucket de Supabase Storage
    if (!data || data.length === 0) {
      await syncStorageWithDatabase();
      const res = await client.from('r2_media').select('*').order('created_at', { ascending: false });
      data = res.data;
    }

    if (error && !data) return c.json({ error: error.message }, 500);
    return c.json({ media: data || [] });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

app.post('/admin/media/sync', async (c) => {
  if (!(await verifyAdmin(c))) return c.json({ error: 'No autorizado' }, 401);
  try {
    const syncedCount = await syncStorageWithDatabase();
    const client = getSupabaseAdmin() || supabase;
    const { data } = await client.from('r2_media').select('*').order('created_at', { ascending: false });
    return c.json({
      success: true,
      syncedCount,
      totalCount: data?.length || 0,
      media: data || []
    });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

app.delete('/admin/media/:id', async (c) => {
  if (!(await verifyAdmin(c))) return c.json({ error: 'No autorizado' }, 401);
  const client = getSupabaseAdmin() || supabase;
  const id = c.req.param('id');

  try {
    const { data: record } = await client.from('r2_media').select('*').eq('id', id).single();
    if (record?.file_key) {
      await deleteFromSupabaseStorage(record.file_key);
    }
    if (record?.public_url) {
      // Si la foto eliminada estaba asignada a alguna autoridad, restaurar al perfil vacío por defecto (null)
      await client.from('autoridades').update({ photo_url: null }).eq('photo_url', record.public_url);
    }
    const { error } = await client.from('r2_media').delete().eq('id', id);
    if (error) return c.json({ error: error.message }, 500);
    return c.json({ success: true, message: 'Archivo eliminado' });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

export default app;
