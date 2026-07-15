const BASE_URL = process.env.UPSTASH_REDIS_REST_KV_REST_API_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN;

async function redisGet(key) {
  const res = await fetch(`${BASE_URL}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
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
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(value),
  });
  if (!res.ok) {
    throw new Error(`redis set failed: ${res.status}`);
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ valid: false, error: "method_not_allowed" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ valid: false, error: "missing_code" });
    }
  }

  const code = typeof body?.code === "string" ? body.code.trim().toUpperCase() : "";
  if (!code) {
    return res.status(400).json({ valid: false, error: "missing_code" });
  }

  try {
    const key = `code:${code}`;
    const existing = await redisGet(key);

    if (existing === null || existing === undefined) {
      return res.status(404).json({ valid: false, error: "invalid_code" });
    }

    const record = typeof existing === "string" ? JSON.parse(existing) : existing;

    if (record.status === "redeemed") {
      return res.status(409).json({ valid: false, error: "already_used" });
    }

    await redisSet(key, {
      ...record,
      status: "redeemed",
      redeemedAt: new Date().toISOString(),
    });

    return res.status(200).json({ valid: true, batchId: record.batchId });
  } catch (error) {
    console.error("validate-access-code error:", error);
    return res.status(500).json({ valid: false, error: "server_error" });
  }
}
