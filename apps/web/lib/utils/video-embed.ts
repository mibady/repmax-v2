/**
 * Video embed utilities for YouTube and Hudl URLs.
 * Extracts video IDs and returns embeddable iframe URLs.
 */

const YOUTUBE_PATTERNS = [
  /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
];

const HUDL_PATTERN = /hudl\.com\/video\/([a-zA-Z0-9]+)/;

export function getYouTubeVideoId(url: string): string | null {
  for (const pattern of YOUTUBE_PATTERNS) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function getYouTubeEmbedUrl(url: string): string | null {
  const videoId = getYouTubeVideoId(url);
  if (!videoId) return null;
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
}

export function getHudlEmbedUrl(url: string): string | null {
  const match = url.match(HUDL_PATTERN);
  if (!match) return null;
  return `https://www.hudl.com/embed/video/${match[1]}`;
}

export function isYouTubeUrl(url: string): boolean {
  return YOUTUBE_PATTERNS.some((p) => p.test(url));
}

export function isHudlUrl(url: string): boolean {
  return HUDL_PATTERN.test(url);
}

export function isEmbeddable(url: string): boolean {
  return isYouTubeUrl(url) || isHudlUrl(url);
}

export function getEmbedUrl(url: string): string | null {
  return getYouTubeEmbedUrl(url) || getHudlEmbedUrl(url);
}
