import Stripe from "stripe";

function setCors(req, res) {
  const origin = req.headers.origin;
  if (
    origin === "https://defensiblezone.ai" ||
    origin === "https://app.defensiblezone.ai" ||
    (typeof origin === "string" && origin.includes("localhost"))
  ) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

const PRODUCT_PATHS = {
  pm: "/pm",
  engineer: "/engineer",
  doctor: "/doctor",
  designer: "/designer",
  finance: "/finance",
  ux: "/ux",
};

function getOrigin(req) {
  const origin = req.headers.origin;
  if (
    origin === "https://defensiblezone.ai" ||
    origin === "https://app.defensiblezone.ai" ||
    (typeof origin === "string" && origin.includes("localhost"))
  ) {
    return origin;
  }
  const proto =
    (typeof req.headers["x-forwarded-proto"] === "string" && req.headers["x-forwarded-proto"]) ||
    "https";
  const host = req.headers.host;
  return host ? `${proto}://${host}` : "https://defensiblezone.ai";
}

function isValidEmail(email) {
  if (typeof email !== "string") return false;
  const trimmed = email.trim();
  const at = trimmed.indexOf("@");
  if (at <= 0) return false;
  return trimmed.indexOf(".", at + 1) !== -1;
}

export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: "Stripe not configured" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: "Invalid request body" });
    }
  }

  const product = typeof body?.product === "string" ? body.product.trim().toLowerCase() : "";
  const path = PRODUCT_PATHS[product];
  if (!path) {
    return res.status(400).json({ error: "Unknown or missing product" });
  }

  const email = body?.email;
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Invalid email" });
  }

  const price = Number(body?.price);
  if (!Number.isFinite(price) || price < 100 || price > 50000) {
    return res.status(400).json({ error: "Invalid price" });
  }

  const origin = getOrigin(req);
  const successUrl = `${origin}${path}?success=true`;
  const cancelUrl = `${origin}${path}?canceled=true`;

  const productNames = {
    pm: "Defensible Zone Product Manager Edition — 90-Day Plan",
    engineer: "Defensible Zone Engineer Edition",
    doctor: "Defensible Zone Physician Edition",
    designer: "Defensible Zone UX Professional Edition",
    finance: "Defensible Zone Finance Edition",
    ux: "Defensible Zone UX Professional Edition — 90-Day Plan",
  };

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email.trim(),
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: Math.round(price),
            product_data: {
              name: productNames[product] || "Defensible Zone",
            },
          },
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        product,
        email: email.trim(),
      },
    });

    if (!session.url) {
      return res.status(500).json({ error: "Could not create checkout session" });
    }

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("create-checkout-session error:", err.message);
    return res.status(500).json({ error: "Could not start checkout. Please try again." });
  }
}
