// ── SIMPLE BROWSER ENCRYPTION FOR PRIVATE COMMENTS ──────────────────────────
// Uses XOR cipher with author_id as key — enough to obscure from casual viewers
// NOT military grade — but fine for hiding contact info from random viewers

function strToBytes(str) {
  return new TextEncoder().encode(str)
}

function bytesToStr(bytes) {
  return new TextDecoder().decode(bytes)
}

function xorBytes(data, key) {
  const keyBytes = strToBytes(key)
  return data.map((b, i) => b ^ keyBytes[i % keyBytes.length])
}

function toBase64(bytes) {
  return btoa(String.fromCharCode(...bytes))
}

function fromBase64(str) {
  return new Uint8Array(atob(str).split('').map(c => c.charCodeAt(0)))
}

export function encryptMessage(text, authorId) {
  const data = strToBytes(text)
  const encrypted = xorBytes(Array.from(data), authorId)
  return 'ENC:' + toBase64(encrypted)
}

export function decryptMessage(encrypted, authorId) {
  try {
    if (!encrypted.startsWith('ENC:')) return encrypted
    const bytes = fromBase64(encrypted.slice(4))
    const decrypted = xorBytes(Array.from(bytes), authorId)
    return bytesToStr(new Uint8Array(decrypted))
  } catch {
    return '[Could not decrypt message]'
  }
}

export function isEncrypted(text) {
  return typeof text === 'string' && text.startsWith('ENC:')
}

export function canDecrypt(noteAuthorId, currentUserId) {
  return noteAuthorId === currentUserId
}
