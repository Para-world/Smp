import { createHmac, randomBytes } from "crypto";

const SECRET = process.env.JWT_SECRET || process.env.BETTER_AUTH_SECRET || "fallback-secret-change-me";
const TOKEN_EXPIRY_HOURS = 24;

interface TokenPayload {
  userId: string;
  role: string;
}

interface FullPayload extends TokenPayload {
  iat: number;
  exp: number;
}

function base64UrlEncode(data: string): string {
  return Buffer.from(data).toString("base64url");
}

function base64UrlDecode(data: string): string {
  return Buffer.from(data, "base64url").toString("utf-8");
}

function createSignature(header: string, payload: string): string {
  return createHmac("sha256", SECRET)
    .update(`${header}.${payload}`)
    .digest("base64url");
}

export async function signToken(payload: TokenPayload): Promise<string> {
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));

  const now = Math.floor(Date.now() / 1000);
  const fullPayload: FullPayload = {
    ...payload,
    iat: now,
    exp: now + TOKEN_EXPIRY_HOURS * 3600,
  };

  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const signature = createSignature(header, encodedPayload);

  return `${header}.${encodedPayload}.${signature}`;
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [header, payload, signature] = parts;
    const expectedSignature = createSignature(header, payload);

    if (signature !== expectedSignature) return null;

    const decoded: FullPayload = JSON.parse(base64UrlDecode(payload));

    // Check expiry
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp < now) return null;

    return { userId: decoded.userId, role: decoded.role };
  } catch {
    return null;
  }
}
