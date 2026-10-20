import { createCipheriv, randomBytes, randomInt } from "node:crypto";

const getCipherAlgorithm = (secret) => {
  const keyLength = Buffer.byteLength(secret, "utf8");
  if (keyLength === 16) return "aes-128-cbc";
  if (keyLength === 24) return "aes-192-cbc";
  if (keyLength === 32) return "aes-256-cbc";
  throw new Error("Invalid ZEGOCLOUD server secret length.");
};

export const generateZegoToken04 = ({ appId, userId, secret, payload, expiresInSeconds }) => {
  if (!Number.isSafeInteger(appId) || appId <= 0 || !userId || typeof userId !== "string") {
    throw new Error("Invalid ZEGOCLOUD token identity.");
  }

  const createdAt = Math.floor(Date.now() / 1000);
  const expiresAt = createdAt + expiresInSeconds;
  const tokenInfo = {
    app_id: appId,
    user_id: userId,
    nonce: randomInt(-2147483648, 2147483647),
    ctime: createdAt,
    expire: expiresAt,
    payload: payload || "",
  };
  const iv = randomBytes(16);
  const cipher = createCipheriv(getCipherAlgorithm(secret), Buffer.from(secret), iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(tokenInfo), "utf8"),
    cipher.final(),
  ]);
  const expirationBuffer = Buffer.alloc(8);
  expirationBuffer.writeBigInt64BE(BigInt(expiresAt));
  const ivLengthBuffer = Buffer.alloc(2);
  ivLengthBuffer.writeUInt16BE(iv.length);
  const encryptedLengthBuffer = Buffer.alloc(2);
  encryptedLengthBuffer.writeUInt16BE(encrypted.length);

  return `04${Buffer.concat([
    expirationBuffer,
    ivLengthBuffer,
    iv,
    encryptedLengthBuffer,
    encrypted,
  ]).toString("base64")}`;
};