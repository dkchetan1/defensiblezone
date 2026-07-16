// ── CORS headers ────────────────────────────────────────────────────────────
function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

const BASE_URL = process.env.UPSTASH_REDIS_REST_KV_REST_API_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN;
const COOKIE_NAME = "dz_employer_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

async function redisGet(key) {
  const res = await fetch(`${BASE_URL}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
  });
  if (!res.ok) {
    throw new Error(`redis get failed: ${res.status}`);
  }
  const data = await res.json();
  return data.result;
}

function parseCookies(header) {
  const out = {};
  if (!header || typeof header !== "string") return out;
  header.split(";").forEach((part) => {
    const idx = part.indexOf("=");
    if (idx === -1) return;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    if (key) out[key] = decodeURIComponent(val);
  });
  return out;
}

function setSessionCookie(res, sessionJwt) {
  const secure = process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
  const parts = [
    `${COOKIE_NAME}=${encodeURIComponent(sessionJwt)}`,
    "HttpOnly",
    "Path=/",
    `Max-Age=${COOKIE_MAX_AGE}`,
    "SameSite=Lax",
  ];
  if (secure) parts.push("Secure");
  res.setHeader("Set-Cookie", parts.join("; "));
}

function signSessionJwt(jwt, secret, email, companyName) {
  return jwt.sign(
    { email, companyName, type: "employer_session" },
    secret,
    { expiresIn: COOKIE_MAX_AGE }
  );
}

async function lookupCompanyName(email) {
  if (!BASE_URL || !REDIS_TOKEN) return null;
  const existing = await redisGet(`employer:${email}`);
  if (existing === null || existing === undefined) return null;
  const record = typeof existing === "string" ? JSON.parse(existing) : existing;
  if (!record || typeof record.companyName !== "string" || !record.companyName.trim()) {
    return null;
  }
  return record.companyName.trim();
}

function isFounder(email) {
  const founders = (process.env.FOUNDER_EMAILS || "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
  return founders.includes(email);
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(200).json({ valid: false, reason: "invalid" });
    }
  }

  const { token } = body || {};
  const cookies = parseCookies(req.headers.cookie);
  const cookieEmail = cookies[COOKIE_NAME];

  try {
    const jwt = (await import("jsonwebtoken")).default;
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(200).json({ valid: false, reason: "invalid" });
    }

    // Magic-link token path (B2C gate_token pattern)
    if (token && typeof token === "string") {
      let decoded;
      try {
        decoded = jwt.verify(token, secret);
      } catch (err) {
        if (err && typeof err === "object" && err.name === "TokenExpiredError") {
          return res.status(200).json({ valid: false, reason: "expired" });
        }
        return res.status(200).json({ valid: false, reason: "invalid" });
      }

      if (!decoded || typeof decoded !== "object") {
        return res.status(200).json({ valid: false, reason: "invalid" });
      }
      if (decoded.type !== "employer") {
        return res.status(200).json({ valid: false, reason: "invalid" });
      }
      if (typeof decoded.email !== "string" || !decoded.email.trim()) {
        return res.status(200).json({ valid: false, reason: "invalid" });
      }

      const email = decoded.email.trim().toLowerCase();
      let companyName = await lookupCompanyName(email);
      if (!companyName && isFounder(email)) {
        companyName = "Founder";
      }
      if (!companyName) {
        return res.status(200).json({ valid: false, reason: "invalid" });
      }

      const sessionJwt = signSessionJwt(jwt, secret, email, companyName);
      setSessionCookie(res, sessionJwt);
      return res.status(200).json({ valid: true, companyName });
    }

    // Returning session: httpOnly cookie with signed employer session JWT
    if (cookieEmail && typeof cookieEmail === "string" && cookieEmail.trim()) {
      let session;
      try {
        session = jwt.verify(cookieEmail.trim(), secret);
      } catch (err) {
        if (err && typeof err === "object" && err.name === "TokenExpiredError") {
          return res.status(200).json({ valid: false, reason: "expired" });
        }
        return res.status(200).json({ valid: false, reason: "invalid" });
      }

      if (!session || typeof session !== "object") {
        return res.status(200).json({ valid: false, reason: "invalid" });
      }
      if (session.type !== "employer_session") {
        return res.status(200).json({ valid: false, reason: "invalid" });
      }
      if (typeof session.email !== "string" || !session.email.trim()) {
        return res.status(200).json({ valid: false, reason: "invalid" });
      }

      const email = session.email.trim().toLowerCase();
      let companyName =
        typeof session.companyName === "string" && session.companyName.trim()
          ? session.companyName.trim()
          : await lookupCompanyName(email);
      if (!companyName && isFounder(email)) {
        companyName = "Founder";
      }
      if (!companyName) {
        return res.status(200).json({ valid: false, reason: "invalid" });
      }
      return res.status(200).json({ valid: true, companyName });
    }

    return res.status(200).json({ valid: false, reason: "invalid" });
  } catch (err) {
    if (err && typeof err === "object" && err.name === "TokenExpiredError") {
      return res.status(200).json({ valid: false, reason: "expired" });
    }
    console.error("verify-employer-token error:", err?.message ?? err);
    return res.status(200).json({ valid: false, reason: "invalid" });
  }
}
