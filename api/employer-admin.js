const BASE_URL = process.env.UPSTASH_REDIS_REST_KV_REST_API_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN;
const COOKIE_NAME = "dz_employer_session";

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function parseCookies(header) {
  const out = {};
  if (!header || typeof header !== "string") return out;
  header.split(";").forEach((part) => {
    const idx = part.indexOf("=");
    if (idx === -1) return;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (key) out[key] = decodeURIComponent(value);
  });
  return out;
}

function parseRecord(existing) {
  if (existing === null || existing === undefined) return null;
  const record =
    typeof existing === "string" ? JSON.parse(existing) : existing;
  return record && typeof record === "object" && !Array.isArray(record)
    ? record
    : null;
}

function isValidEmail(email) {
  if (typeof email !== "string") return false;
  const trimmed = email.trim();
  const at = trimmed.indexOf("@");
  if (at <= 0 || at !== trimmed.lastIndexOf("@")) return false;
  const domain = trimmed.slice(at + 1);
  return domain.includes(".") && !domain.startsWith(".") && !domain.endsWith(".");
}

function isValidQuota(quota) {
  return typeof quota === "number" && Number.isInteger(quota) && quota >= 0;
}

async function redisGet(key) {
  const response = await fetch(`${BASE_URL}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
  });
  if (!response.ok) {
    throw new Error(`redis get failed: ${response.status}`);
  }
  const data = await response.json();
  return data.result;
}

async function redisSet(key, value) {
  const response = await fetch(`${BASE_URL}/set/${encodeURIComponent(key)}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${REDIS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(value),
  });
  if (!response.ok) {
    throw new Error(`redis set failed: ${response.status}`);
  }
}

async function redisKeys(pattern) {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${REDIS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(["KEYS", pattern]),
  });
  if (!response.ok) {
    throw new Error(`redis keys failed: ${response.status}`);
  }
  const data = await response.json();
  return Array.isArray(data.result) ? data.result : [];
}

async function redisPipeline(commands) {
  if (!commands.length) return [];
  const response = await fetch(`${BASE_URL}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${REDIS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commands),
  });
  if (!response.ok) {
    throw new Error(`redis pipeline failed: ${response.status}`);
  }
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

async function verifyEmployerSession(req) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return { ok: false, status: 401, error: "unauthorized" };
  }

  const sessionToken = parseCookies(req.headers.cookie)[COOKIE_NAME];
  if (!sessionToken || typeof sessionToken !== "string" || !sessionToken.trim()) {
    return { ok: false, status: 401, error: "unauthorized" };
  }

  const jwt = (await import("jsonwebtoken")).default;
  let session;
  try {
    session = jwt.verify(sessionToken.trim(), secret);
  } catch {
    return { ok: false, status: 401, error: "unauthorized" };
  }

  if (
    !session ||
    typeof session !== "object" ||
    session.type !== "employer_session" ||
    typeof session.email !== "string" ||
    !session.email.trim()
  ) {
    return { ok: false, status: 401, error: "unauthorized" };
  }

  return { ok: true, email: session.email.trim().toLowerCase() };
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
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method_not_allowed" });
  }

  try {
    const auth = await verifyEmployerSession(req);
    if (!auth.ok) {
      return res.status(auth.status).json({ error: auth.error });
    }
    if (!isFounder(auth.email)) {
      return res.status(403).json({ error: "forbidden" });
    }

    if (!BASE_URL || !REDIS_TOKEN) {
      console.error("employer-admin: Redis not configured");
      return res.status(500).json({ error: "server_error" });
    }

    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {
        return res.status(400).json({ error: "invalid_body" });
      }
    }
    body = body || {};

    if (body.action === "list") {
      const keys = await redisKeys("employer:*");
      const results = await redisPipeline(keys.map((key) => ["GET", key]));
      const employers = [];

      for (let i = 0; i < keys.length; i++) {
        const employer = parseRecord(results[i]?.result);
        if (!employer) continue;
        employers.push({
          email: keys[i].slice("employer:".length),
          companyName:
            typeof employer.companyName === "string" ? employer.companyName : "",
          quota: typeof employer.quota === "number" ? employer.quota : 0,
          codesGenerated:
            typeof employer.codesGenerated === "number"
              ? employer.codesGenerated
              : 0,
          batchCount: Array.isArray(employer.batches)
            ? employer.batches.length
            : 0,
        });
      }

      employers.sort((a, b) => a.email.localeCompare(b.email));
      return res.status(200).json({ employers });
    }

    if (body.action === "create") {
      if (
        !isValidEmail(body.email) ||
        typeof body.companyName !== "string" ||
        !body.companyName.trim() ||
        !isValidQuota(body.quota)
      ) {
        return res.status(400).json({ error: "invalid_input" });
      }

      const email = body.email.trim().toLowerCase();
      const key = `employer:${email}`;
      const existing = await redisGet(key);
      if (existing !== null && existing !== undefined) {
        return res.status(409).json({ error: "already_exists" });
      }

      await redisSet(key, {
        companyName: body.companyName.trim(),
        quota: body.quota,
        codesGenerated: 0,
        batches: [],
        createdAt: new Date().toISOString(),
      });
      return res.status(201).json({ created: true });
    }

    if (body.action === "update_quota") {
      if (!isValidEmail(body.email) || !isValidQuota(body.quota)) {
        return res.status(400).json({ error: "invalid_input" });
      }

      const email = body.email.trim().toLowerCase();
      const key = `employer:${email}`;
      const employer = parseRecord(await redisGet(key));
      if (!employer) {
        return res.status(404).json({ error: "not_found" });
      }

      const codesGenerated =
        typeof employer.codesGenerated === "number"
          ? employer.codesGenerated
          : 0;
      if (body.quota < codesGenerated) {
        return res.status(400).json({
          error: "quota_below_codes_generated",
          message: "quota cannot be lower than codesGenerated",
          codesGenerated,
        });
      }

      await redisSet(key, { ...employer, quota: body.quota });
      return res.status(200).json({ updated: true });
    }

    return res.status(400).json({ error: "invalid_action" });
  } catch (err) {
    console.error("employer-admin error:", err?.message ?? err);
    return res.status(500).json({ error: "server_error" });
  }
}
