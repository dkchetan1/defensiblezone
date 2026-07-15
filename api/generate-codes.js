import { randomBytes, randomUUID } from "crypto";

const BASE_URL = process.env.UPSTASH_REDIS_REST_KV_REST_API_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN;
const COOKIE_NAME = "dz_employer_session";

/** Max codes allowed in a single generate request. */
const MAX_PER_REQUEST = 500;

/** Code alphabet: uppercase alphanumeric, no 0/O/1/I. */
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 8;

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

async function redisSet(key, value) {
  const res = await fetch(`${BASE_URL}/set/${encodeURIComponent(key)}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${REDIS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(value),
  });
  if (!res.ok) {
    throw new Error(`redis set failed: ${res.status} key=${key}`);
  }
}

function parseRecord(existing) {
  if (existing === null || existing === undefined) return null;
  return typeof existing === "string" ? JSON.parse(existing) : existing;
}

function generateOneCode() {
  const bytes = randomBytes(CODE_LENGTH);
  let out = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    out += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  }
  return out;
}

async function generateUniqueCodes(count) {
  const codes = [];
  const seen = new Set();
  const maxAttempts = count * 20;

  for (let attempts = 0; codes.length < count && attempts < maxAttempts; attempts++) {
    const code = generateOneCode();
    if (seen.has(code)) continue;

    const existing = await redisGet(`code:${code}`);
    if (existing !== null && existing !== undefined) continue;

    seen.add(code);
    codes.push(code);
  }

  if (codes.length < count) {
    throw new Error(
      `failed to generate ${count} unique codes after ${maxAttempts} attempts (got ${codes.length})`
    );
  }
  return codes;
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

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: "invalid_body" });
    }
  }
  body = body || {};

  try {
    if (!BASE_URL || !REDIS_TOKEN) {
      console.error("generate-codes: Redis not configured");
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

    const quota = typeof employer.quota === "number" ? employer.quota : 0;
    const codesGenerated =
      typeof employer.codesGenerated === "number" ? employer.codesGenerated : 0;
    const batches = Array.isArray(employer.batches) ? employer.batches : [];

    // No count → return current usage only (for portal display; no writes).
    if (body.count === undefined || body.count === null) {
      return res.status(200).json({
        quota,
        codesGenerated,
        remaining: Math.max(0, quota - codesGenerated),
      });
    }

    const count = body.count;
    if (
      typeof count !== "number" ||
      !Number.isInteger(count) ||
      count < 1
    ) {
      return res.status(400).json({
        error: "invalid_count",
        message: "count must be a positive integer",
      });
    }
    if (count > MAX_PER_REQUEST) {
      return res.status(400).json({
        error: "invalid_count",
        message: `count cannot exceed ${MAX_PER_REQUEST} per request`,
        max: MAX_PER_REQUEST,
      });
    }

    const remaining = quota - codesGenerated;
    if (codesGenerated + count > quota) {
      // Reject before any Redis writes — no partial state on quota_exceeded.
      return res.status(400).json({
        error: "quota_exceeded",
        remaining: Math.max(0, remaining),
      });
    }

    // Pre-generate all unique codes (collision-checked) before any writes.
    const codes = await generateUniqueCodes(count);
    const batchId = randomUUID();
    const createdAt = new Date().toISOString();

    const writtenCodeKeys = [];
    let batchWritten = false;
    let employerUpdated = false;

    try {
      await redisSet(`batch:${batchId}`, {
        employerEmail: email,
        codeCount: count,
        createdAt,
      });
      batchWritten = true;

      for (const code of codes) {
        await redisSet(`code:${code}`, {
          batchId,
          status: "unused",
          redeemedAt: null,
        });
        writtenCodeKeys.push(`code:${code}`);
      }

      await redisSet(`employer:${email}`, {
        ...employer,
        codesGenerated: codesGenerated + count,
        batches: [...batches, batchId],
      });
      employerUpdated = true;
    } catch (writeErr) {
      console.error("generate-codes partial write failure:", {
        email,
        batchId,
        count,
        batchWritten,
        codesWritten: writtenCodeKeys.length,
        writtenCodeKeys,
        employerUpdated,
        error: writeErr?.message ?? writeErr,
      });
      return res.status(500).json({ error: "server_error" });
    }

    return res.status(200).json({
      batchId,
      codes,
      quota,
      codesGenerated: codesGenerated + count,
      remaining: Math.max(0, quota - (codesGenerated + count)),
    });
  } catch (err) {
    console.error("generate-codes error:", err?.message ?? err);
    return res.status(500).json({ error: "server_error" });
  }
}
