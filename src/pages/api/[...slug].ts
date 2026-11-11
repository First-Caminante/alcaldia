import type { APIRoute } from 'astro';
import app from '../../lib/hono-app';

export const prerender = false;

export const ALL: APIRoute = async ({ request }) => {
  return app.fetch(request);
};
