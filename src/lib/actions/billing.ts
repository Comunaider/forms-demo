"use server"

import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

export async function createCheckoutSessionAction() {
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
  })

  let customerId = user.stripeCustomerId
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name ?? undefined,
    })
    customerId = customer.id
    await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customerId },
    })
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
    success_url: `${appUrl}/dashboard?checkout=success`,
    cancel_url: `${appUrl}/subscribe?checkout=cancelled`,
  })

  if (!checkoutSession.url) {
    throw new Error("Stripe não retornou uma URL de checkout")
  }

  redirect(checkoutSession.url)
}

export async function createPortalSessionAction() {
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
  })

  if (!user.stripeCustomerId) {
    redirect("/subscribe")
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${appUrl}/dashboard`,
  })

  redirect(portalSession.url)
}
