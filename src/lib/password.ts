// Local-demo password protection; authorization still requires a real backend.
const ITERATIONS = 600_000;
const PREFIX = 'pbkdf2-sha256';
const hex = (bytes: Uint8Array) => Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');

export function legacyHash(value: string): string {
  let h = 5381;
  for (let i = 0; i < value.length; i++) h = ((h << 5) + h + value.charCodeAt(i)) | 0;
  return String(h >>> 0);
}

async function derive(password: string, salt: Uint8Array<ArrayBuffer>): Promise<string> {
  if (!crypto.subtle) throw new Error('Abra o site em localhost ou HTTPS para entrar com segurança.');
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: ITERATIONS }, key, 256);
  return hex(new Uint8Array(bits));
}

export async function createPasswordSecret(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return `${PREFIX}$${ITERATIONS}$${hex(salt)}$${await derive(password, salt)}`;
}

export async function verifyPassword(password: string, secret: string, email: string): Promise<boolean> {
  if (/^\d{1,10}$/.test(secret)) return secret === legacyHash(`${email}:${password}`);
  const match = /^pbkdf2-sha256\$600000\$([a-f0-9]{32})\$([a-f0-9]{64})$/.exec(secret);
  if (!match) return false;
  const salt = new Uint8Array(match[1].match(/.{2}/g)!.map(byte => parseInt(byte, 16)));
  const actual = await derive(password, salt);
  let difference = 0;
  for (let i = 0; i < actual.length; i++) difference |= actual.charCodeAt(i) ^ match[2].charCodeAt(i);
  return difference === 0;
}
