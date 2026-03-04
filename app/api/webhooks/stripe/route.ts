import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      const userId = session.client_reference_id
      const productId = session.metadata?.productId

      if (!userId || !productId) {
        console.error('Missing userId or productId in session metadata')
        return NextResponse.json({ error: 'Invalid session data' }, { status: 400 })
      }

      const product = await prisma.product.findUnique({
        where: { id: productId },
      })

      if (!product) {
        console.error('Product not found:', productId)
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }

      const lineItems = await stripe.checkout.sessions.listLineItems(session.id)
      const quantity = lineItems.data[0]?.quantity || 1
      const total = (session.amount_total || 0) / 100

      // Create order
      const order = await prisma.order.create({
        data: {
          userId,
          stripeSessionId: session.id,
          status: 'PENDING',
          total,
          items: {
            create: {
              productId,
              quantity,
              price: product.price,
            },
          },
        },
      })

      // Update product stock
      await prisma.product.update({
        where: { id: productId },
        data: {
          stock: {
            decrement: quantity,
          },
        },
      })

      console.log('Order created:', order.id)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: error.message || 'Webhook handler failed' },
      { status: 500 }
    )
  }
}





