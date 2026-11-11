import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // Proteger todas las rutas de /admin excepto /admin/login
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = context.cookies.get('gam_admin_token')?.value;
    if (!token) {
      return context.redirect('/admin/login');
    }
  }

  return next();
});
