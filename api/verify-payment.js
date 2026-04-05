import Stripe from "stripe";
import jwt from "jsonwebtoken";

// ── CORS headers ────────────────────────────────────────────────────────────
function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "https://defensiblezone.ai");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

// ── Price → tier mapping ─────────────────────────────────────────────────────
// Map your Stripe Price IDs to tier numbers.
// Find these in Stripe Dashboard → Products → each price → "API ID"
const PRICE_TIER_MAP = {
  // Engineer & Doctor $29 Recommendations
  // Replace with your actual Price IDs from Stripe
  "price_engineer_29": 2,
  "price_doctor_29":   2,
  // Engineer & Doctor $34 PDF
  "price_engineer_34": 3,
  "price_doctor_34":   3,
};

// Fallback: if Price ID isn't mapped, infer tier from amount
function tierFromAmount(amountTotal) {
  if (amountTotal <= 2900) return 2; // $29.00
  if (amountTotal <= 3400) return 3; // $34.00
  return 2; // default to tier 2
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { session_id, product } = req.body || {};

  if (!session_id || typeof session_id !== "string") {
    return res.status(400).json({ error: "Missing session_id" });
  }

  // Validate product is one of the known tools
  const knownProducts = ["engineer", "doctor"];
  const safeProduct = knownProducts.includes(product) ? product : "engineer";

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: "Stripe not configured" });
  }
  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ error: "JWT not configured" });
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    });

    // Retrieve the Checkout Session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["line_items"],
    });

    // Must be paid
    if (session.payment_status !== "paid") {
      return res.status(402).json({ error: "Payment not completed" });
    }

    // Determine tier from price ID or amount
    let tier = 2;
    const lineItems = session.line_items?.data || [];
    if (lineItems.length > 0) {
      const priceId = lineItems[0].price?.id;
      if (priceId && PRICE_TIER_MAP[priceId] !== undefined) {
        tier = PRICE_TIER_MAP[priceId];
      } else {
        tier = tierFromAmount(session.amount_total);
      }
    } else {
      tier = tierFromAmount(session.amount_total);
    }

    // Issue a JWT — 10-year expiry (one-time purchase = permanent access)
    const token = jwt.sign(
      {
        tier,
        product: safeProduct,
        session_id,           // store so we can revoke if needed later
      },
      process.env.JWT_SECRET,
      { expiresIn: "3650d" } // 10 years
    );

    return res.status(200).json({ token, tier });

  } catch (err) {
    console.error("verify-payment error:", err.message);
    // Don't leak Stripe error details to client
    return res.status(500).json({ error: "Verification failed. Please contact support." });
  }
}
