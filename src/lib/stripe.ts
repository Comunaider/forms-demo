import Stripe from "stripe"

// Falls back to a placeholder so the SDK can be instantiated at build/import
// time even before STRIPE_SECRET_KEY is configured; real calls will fail
// with an auth error until the env var is set, instead of crashing the build.
const secretKey = process.env.STRIPE_SECRET_KEY || "sk_test_not_configured"

export const stripe = new Stripe(secretKey, {
  apiVersion: "2026-08-26.dahlia",
})
