/**
 * Utilidades para detección e incrustación segura de videos de YouTube
 * Cumple con estándares de privacidad y no cookies (youtube-nocookie.com)
 */

export function getYouTubeId(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // Reconoce:
  // - https://www.youtube.com/watch?v=XXXXXXXXXXX
  // - https://youtu.be/XXXXXXXXXXX
  // - https://www.youtube.com/embed/XXXXXXXXXXX
  // - https://www.youtube.com/shorts/XXXXXXXXXXX
  // - https://m.youtube.com/watch?v=XXXXXXXXXXX
  const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/;
  const match = trimmed.match(regExp);
  return match && match[1] ? match[1] : null;
}

export function getYouTubeEmbedUrl(url: string | null | undefined, autoPlay: boolean = false): string | null {
  const videoId = getYouTubeId(url);
  if (!videoId) return null;

  const params = new URLSearchParams({
    rel: '0',
    modestbranding: '1',
    playsinline: '1'
  });

  if (autoPlay) {
    params.set('autoplay', '1');
    params.set('mute', '1');
  }

  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}

export function isYouTubeUrl(url: string | null | undefined): boolean {
  return Boolean(getYouTubeId(url));
}
