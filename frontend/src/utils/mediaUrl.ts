/** Origem pública do backend a partir de NEXT_PUBLIC_BACKEND_URL (sem `/api/v1`). */
export function getBackendPublicOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_BACKEND_URL?.trim();
  if (!raw) return '';
  try {
    const normalized = raw.includes('://') ? raw : `https://${raw}`;
    const u = new URL(normalized);
    return `${u.protocol}//${u.host}`;
  } catch {
    return '';
  }
}

function isNonPublicHost(hostname: string): boolean {
  if (hostname === 'localhost' || hostname === '127.0.0.1') return true;
  if (hostname.startsWith('192.168.')) return true;
  if (hostname.startsWith('10.')) return true;
  const m = /^172\.(\d+)\./.exec(hostname);
  if (m) {
    const second = Number(m[1]);
    if (second >= 16 && second <= 31) return true;
  }
  return false;
}

/** Reescreve host local/privado e http→https no mesmo host do backend para carregar em dispositivos móveis. */
export function resolvePostMediaUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;

  const backendOrigin = getBackendPublicOrigin();
  if (!backendOrigin) return trimmed;

  let backendHost: string;
  try {
    backendHost = new URL(backendOrigin).hostname;
  } catch {
    return trimmed;
  }

  try {
    const u = new URL(trimmed, backendOrigin);

    if (isNonPublicHost(u.hostname)) {
      return `${backendOrigin}${u.pathname}${u.search}${u.hash}`;
    }

    if (u.hostname === backendHost && u.protocol === 'http:') {
      return `https://${u.host}${u.pathname}${u.search}${u.hash}`;
    }

    return trimmed;
  } catch {
    if (trimmed.startsWith('/')) {
      return `${backendOrigin}${trimmed}`;
    }
    return trimmed;
  }
}
