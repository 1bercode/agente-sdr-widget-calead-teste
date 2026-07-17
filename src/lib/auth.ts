const SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

async function hmacSha256(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export function verifyPassword(input: string, expected: string): boolean {
  if (input.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < input.length; i++) {
    diff |= input.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

export async function createSessionCookieValue(secret: string): Promise<string> {
  const exp = Date.now() + SESSION_MAX_AGE_MS;
  const nonce = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const payload = `${exp}.${nonce}`;
  const sig = await hmacSha256(secret, payload);
  return `${payload}.${sig}`;
}

export async function verifySessionCookieValue(
  token: string | undefined,
  secret: string
): Promise<boolean> {
  if (!token || !secret) return false;

  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [expStr, nonce, sig] = parts;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || Date.now() > exp) return false;

  const payload = `${expStr}.${nonce}`;
  const expected = await hmacSha256(secret, payload);
  return timingSafeEqualHex(sig, expected);
}
