/**
 * Utilidades para convertir cualquier formato de ubicación de Google Maps
 * (enlaces cortos maps.app.goo.gl, enlaces completos, código <iframe>,
 * coordenadas "lat, lng" o texto de dirección) a una URL embebible y segura.
 */

const GOOGLE_EMBED_HOST_REGEX = /^https?:\/\/(www\.)?(google\.[a-z.]+|maps\.google\.[a-z.]+)\//i;
const SHORT_MAPS_HOST_REGEX = /^https?:\/\/(maps\.app\.goo\.gl|goo\.gl\/maps|g\.co\/maps)/i;
const COORDS_REGEX = /^\s*(-?\d{1,2}(?:\.\d+)?)\s*[,;\s]\s*(-?\d{1,3}(?:\.\d+)?)\s*$/;

export function extractIframeSrc(input: string): string {
  const trimmed = input.trim();
  if (!trimmed.toLowerCase().includes('<iframe')) return trimmed;
  const match = trimmed.match(/src\s*=\s*["']([^"']+)["']/i);
  return match ? match[1].trim() : trimmed;
}

export function buildSimpleEmbedUrl(query: string, zoom = 16): string {
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&hl=es&z=${zoom}&output=embed`;
}

export function isGoogleShortUrl(input: string): boolean {
  return SHORT_MAPS_HOST_REGEX.test(extractIframeSrc(input));
}

export function convertGoogleMapsInputToEmbed(rawInput: string, defaultZoom = 16): string {
  const cleaned = extractIframeSrc(rawInput || '');
  if (!cleaned) return '';

  // 1. Coordenadas directas: "-16.492878, -68.138191"
  const coordsMatch = cleaned.match(COORDS_REGEX);
  if (coordsMatch) {
    const lat = Number(coordsMatch[1]);
    const lng = Number(coordsMatch[2]);
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return buildSimpleEmbedUrl(`${lat},${lng}`, defaultZoom);
    }
  }

  // 2. Texto libre de dirección o lugar (no empieza con http:// ni https://)
  if (!/^https?:\/\//i.test(cleaned)) {
    return buildSimpleEmbedUrl(cleaned, defaultZoom);
  }

  // 3. Ya es una URL de embed válida
  if (/\/maps\/embed/i.test(cleaned) || /[?&]output=embed/i.test(cleaned)) {
    return cleaned;
  }

  // 4. URL completa de Google Maps: extraer !3d...!4d..., @lat,lng,zoom o parámetros q/ll/query
  if (GOOGLE_EMBED_HOST_REGEX.test(cleaned)) {
    const exactPinMatch = cleaned.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
    const viewportMatch = cleaned.match(/@(-?\d+\.\d+),(-?\d+\.\d+)(?:,(\d+(?:\.\d+)?)z)?/);
    const zoom = viewportMatch?.[3] ? Math.round(Number(viewportMatch[3])) : defaultZoom;

    if (exactPinMatch) {
      return buildSimpleEmbedUrl(`${exactPinMatch[1]},${exactPinMatch[2]}`, zoom);
    }
    if (viewportMatch) {
      return buildSimpleEmbedUrl(`${viewportMatch[1]},${viewportMatch[2]}`, zoom);
    }

    try {
      const parsed = new URL(cleaned);
      const q = parsed.searchParams.get('q') || parsed.searchParams.get('query') || parsed.searchParams.get('ll');
      if (q) {
        return buildSimpleEmbedUrl(q, defaultZoom);
      }

      const placeMatch = parsed.pathname.match(/\/maps\/place\/([^/]+)/i);
      if (placeMatch?.[1]) {
        const decodedPlace = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
        return buildSimpleEmbedUrl(decodedPlace, defaultZoom);
      }
    } catch {}
  }

  return cleaned;
}

/**
 * Resuelve enlaces cortos (maps.app.goo.gl) siguiendo redirecciones en el servidor
 * y devuelve la URL lista para incrustar en <iframe>.
 */
export async function resolveAndConvertMapInput(rawInput: string, defaultZoom = 16): Promise<{
  embedUrl: string;
  resolvedUrl?: string;
}> {
  const cleaned = extractIframeSrc(rawInput || '');
  if (!cleaned) return { embedUrl: '' };

  if (!isGoogleShortUrl(cleaned)) {
    return { embedUrl: convertGoogleMapsInputToEmbed(cleaned, defaultZoom) };
  }

  let currentUrl = cleaned;
  try {
    for (let hop = 0; hop < 6; hop++) {
      const res = await fetch(currentUrl, {
        method: 'GET',
        redirect: 'manual',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; GAMPelechucoBot/1.0)',
        },
      });

      const location = res.headers.get('location');
      if (location) {
        const nextUrl = new URL(location, currentUrl).toString();
        // Si Google redirige a consent.google.com, extraer parámetro continue
        try {
          const parsedNext = new URL(nextUrl);
          if (parsedNext.hostname.includes('consent.google.')) {
            const cont = parsedNext.searchParams.get('continue');
            if (cont) {
              currentUrl = cont;
              break;
            }
          }
        } catch {}
        currentUrl = nextUrl;
        if (!isGoogleShortUrl(currentUrl) && /\/maps\/(place|search|@)|!3d/i.test(currentUrl)) {
          break;
        }
        continue;
      }

      if (res.url && res.url !== currentUrl) {
        currentUrl = res.url;
      }
      break;
    }
  } catch {
    // Fallback al valor original si no hay red
  }

  return {
    resolvedUrl: currentUrl,
    embedUrl: convertGoogleMapsInputToEmbed(currentUrl, defaultZoom),
  };
}

/**
 * Genera una URL directa para "Abrir en Google Maps ↗" a partir de una URL embed.
 */
export function toGoogleMapsOpenUrl(embedUrl: string, fallbackQuery: string): string {
  if (!embedUrl) return `https://maps.google.com/?q=${encodeURIComponent(fallbackQuery)}`;

  try {
    const parsed = new URL(embedUrl);
    const q = parsed.searchParams.get('q') || parsed.searchParams.get('query');
    if (q) {
      return `https://maps.google.com/?q=${encodeURIComponent(q)}`;
    }
    const pb = parsed.searchParams.get('pb') || '';
    const pbCoords = pb.match(/!2d(-?\d+\.\d+)!3d(-?\d+\.\d+)/);
    if (pbCoords) {
      return `https://maps.google.com/?q=${pbCoords[2]},${pbCoords[1]}`;
    }
  } catch {}

  if (!/\/maps\/embed/i.test(embedUrl) && !/output=embed/i.test(embedUrl)) {
    return embedUrl;
  }
  return `https://maps.google.com/?q=${encodeURIComponent(fallbackQuery)}`;
}
