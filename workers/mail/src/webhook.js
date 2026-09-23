/**
 * Standard Webhooks verification (what Supabase Auth Hooks use).
 *
 * Headers: webhook-id, webhook-timestamp, webhook-signature ("v1,<base64>" — several, space separated, when
 * the secret was rotated). Signed content: `${id}.${timestamp}.${rawBody}` with HMAC-SHA256 over the secret
 * bytes. The dashboard hands out the secret as `v1,whsec_<base64>`.
 */
const TOLERANCE_S = 5 * 60;

function b64ToBytes(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
function bytesToB64(bytes) {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s);
}

/** `v1,whsec_abc` → raw key bytes; also accepts a bare `whsec_abc` or bare base64. */
export function secretBytes(secret) {
  let s = String(secret || '').trim();
  const parts = s.split(',');
  s = parts[parts.length - 1];
  if (s.startsWith('whsec_')) s = s.slice(6);
  return b64ToBytes(s);
}

export async function sign(secret, id, timestamp, body) {
  const key = await crypto.subtle.importKey('raw', secretBytes(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${id}.${timestamp}.${body}`));
  return bytesToB64(new Uint8Array(sig));
}

/**
 * @param {string} secret  the hook secret from the dashboard
 * @param {{ 'webhook-id'?: string, 'webhook-timestamp'?: string, 'webhook-signature'?: string }} headers lower-case
 * @param {string} body raw request body
 * @param {number} [now] ms
 * @returns {Promise<boolean>}
 */
export async function verify(secret, headers, body, now = Date.now()) {
  const id = headers['webhook-id'];
  const ts = headers['webhook-timestamp'];
  const sigHeader = headers['webhook-signature'];
  if (!id || !ts || !sigHeader) return false;
  const t = Number(ts);
  if (!Number.isFinite(t) || Math.abs(now / 1000 - t) > TOLERANCE_S) return false;
  const expected = await sign(secret, id, ts, body);
  const given = sigHeader.split(' ').map((p) => p.split(',')[1]).filter(Boolean);
  return given.some((g) => timingSafeEqual(g, expected));
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
