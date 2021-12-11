import nacl from "tweetnacl";
import util from "tweetnacl-util";

export function genKeys() {
  return nacl.box.keyPair();
}

export function genNonce() {
  return nacl.randomBytes(nacl.box.nonceLength);
}

export function encryptMessage(
  message: string,
  keys: nacl.BoxKeyPair,
  nonce: Uint8Array
) {
  const messageBytes = util.decodeUTF8(message);
  const encryptedBytes = nacl.box(
    messageBytes,
    nonce,
    keys.publicKey,
    keys.secretKey
  );
  return util.encodeBase64(encryptedBytes);
}

export function decryptMessage(
  payload: string,
  keys: nacl.BoxKeyPair,
  nonce: Uint8Array
) {
  const messageBytes = util.decodeBase64(payload);
  const decryptedBytes = nacl.box.open(
    messageBytes,
    nonce,
    keys.publicKey,
    keys.secretKey
  );
  return decryptedBytes ? util.encodeUTF8(decryptedBytes) : null;
}

export function encryptJSON<T = any>(
  json: T,
  keys: nacl.BoxKeyPair,
  nonce: Uint8Array
) {
  return encryptMessage(JSON.stringify(json), keys, nonce);
}

export function decryptJSON<T = any>(
  payload: string,
  keys: nacl.BoxKeyPair,
  nonce: Uint8Array
): T | null {
  const decrypted = decryptMessage(payload, keys, nonce);
  if (!decrypted) return null;
  try {
    return JSON.parse(decrypted);
  } catch {
    return null;
  }
}
