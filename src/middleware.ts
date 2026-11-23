import { defineMiddleware } from 'astro:middleware';
import { verifyOrRefreshAdminSession } from './lib/auth';

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // Proteger todas las rutas de /admin excepto /admin/login
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const accessToken = context.cookies.get('gam_admin_token')?.value;
    const refreshToken = context.cookies.get('gam_admin_refresh')?.value;

    const session = await verifyOrRefreshAdminSession(accessToken, refreshToken);

    if (!session.valid || !session.accessToken) {
      const hadStaleCookie = Boolean(accessToken || refreshToken);
      context.cookies.delete('gam_admin_token', { path: '/' });
      context.cookies.delete('gam_admin_refresh', { path: '/' });
      return context.redirect(hadStaleCookie ? '/admin/login?expired=1' : '/admin/login');
    }

    if (session.refreshed) {
      context.cookies.set('gam_admin_token', session.accessToken, {
        path: '/',
        maxAge: 604800,
        sameSite: 'lax',
      });
      if (session.refreshToken) {
        context.cookies.set('gam_admin_refresh', session.refreshToken, {
          path: '/',
          maxAge: 2592000,
          sameSite: 'lax',
        });
      }
      context.locals.adminAccessToken = session.accessToken;
      context.locals.adminRefreshToken = session.refreshToken;
      context.locals.adminSessionRefreshed = true;
    }
  }

  return next();
});
