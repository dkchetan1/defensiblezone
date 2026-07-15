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
    const val = part.slice(idx + 1).trim();
    if (key) out[key] = decodeURIComponent(val);
  });
  return out;
}

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

async function redisKeys(pattern) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${REDIS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(["KEYS", pattern]),
  });
  if (!res.ok) {
    throw new Error(`redis keys failed: ${res.status}`);
  }
  const data = await res.json();
  return Array.isArray(data.result) ? data.result : [];
}

async function redisPipeline(commands) {
  if (!commands.length) return [];
  const res = await fetch(`${BASE_URL}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${REDIS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commands),
  });
  if (!res.ok) {
    throw new Error(`redis pipeline failed: ${res.status}`);
  }
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

function parseRecord(existing) {
  if (existing === null || existing === undefined) return null;
  return typeof existing === "string" ? JSON.parse(existing) : existing;
}

async function verifyEmployerSession(req) {
  const jwt = (await import("jsonwebtoken")).default;
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return { ok: false, status: 401, error: "unauthorized" };
  }

  const cookies = parseCookies(req.headers.cookie);
  const sessionToken = cookies[COOKIE_NAME];
  if (!sessionToken || typeof sessionToken !== "string" || !sessionToken.trim()) {
    return { ok: false, status: 401, error: "unauthorized" };
  }

  let session;
  try {
    session = jwt.verify(sessionToken.trim(), secret);
  } catch {
    return { ok: false, status: 401, error: "unauthorized" };
  }

  if (!session || typeof session !== "object") {
    return { ok: false, status: 401, error: "unauthorized" };
  }
  if (session.type !== "employer_session") {
    return { ok: false, status: 401, error: "unauthorized" };
  }
  if (typeof session.email !== "string" || !session.email.trim()) {
    return { ok: false, status: 401, error: "unauthorized" };
  }

  return { ok: true, email: session.email.trim().toLowerCase() };
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method_not_allowed" });
  }

  try {
    if (!BASE_URL || !REDIS_TOKEN) {
      console.error("batch-report: Redis not configured");
      return res.status(500).json({ error: "server_error" });
    }

    const auth = await verifyEmployerSession(req);
    if (!auth.ok) {
      return res.status(auth.status).json({ error: auth.error });
    }
    const email = auth.email;

    const existing = await redisGet(`employer:${email}`);
    const employer = parseRecord(existing);
    if (!employer) {
      return res.status(404).json({ error: "not_found" });
    }

    const batchIds = Array.isArray(employer.batches) ? employer.batches : [];
    if (batchIds.length === 0) {
      return res.status(200).json({ batches: [] });
    }

    const batchIdSet = new Set(batchIds);
    const counts = {};
    for (const batchId of batchIds) {
      counts[batchId] = { redeemed: 0, unused: 0 };
    }

    // No reverse index batch→codes today; scan code:* once and attribute by batchId.
    const codeKeys = await redisKeys("code:*");
    const codeResults = await redisPipeline(
      codeKeys.map((key) => ["GET", key])
    );

    for (const entry of codeResults) {
      const record = parseRecord(entry?.result);
      if (!record || typeof record.batchId !== "string") continue;
      if (!batchIdSet.has(record.batchId)) continue;
      if (record.status === "redeemed") {
        counts[record.batchId].redeemed += 1;
      } else if (record.status === "unused") {
        counts[record.batchId].unused += 1;
      }
    }

    const batchResults = await redisPipeline(
      batchIds.map((id) => ["GET", `batch:${id}`])
    );

    const batches = [];
    for (let i = 0; i < batchIds.length; i++) {
      const batchId = batchIds[i];
      const batch = parseRecord(batchResults[i]?.result) || {};
      const c = counts[batchId] || { redeemed: 0, unused: 0 };
      batches.push({
        batchId,
        createdAt: typeof batch.createdAt === "string" ? batch.createdAt : "",
        codeCount: typeof batch.codeCount === "number" ? batch.codeCount : 0,
        redeemed: c.redeemed,
        unused: c.unused,
      });
    }

    batches.sort(function (a, b) {
      if (a.createdAt === b.createdAt) return 0;
      if (!a.createdAt) return 1;
      if (!b.createdAt) return -1;
      return a.createdAt < b.createdAt ? 1 : -1;
    });

    return res.status(200).json({ batches });
  } catch (err) {
    console.error("batch-report error:", err?.message ?? err);
    return res.status(500).json({ error: "server_error" });
  }
}
