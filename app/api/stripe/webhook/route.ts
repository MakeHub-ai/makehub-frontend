import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    let event: Stripe.Event

    try {
      // Vérifier la signature Stripe
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json({ message: 'Webhook signature verification failed' }, { status: 400 })
    }

    // Traiter l'événement payment_intent.succeeded
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent

      const userId = paymentIntent.metadata.user_id
      const amountEuros = parseFloat(paymentIntent.metadata.amount_euros)

      if (!userId || !amountEuros) {
        console.error('Missing metadata in payment intent:', { userId, amountEuros })
        return NextResponse.json({ message: 'Missing metadata' }, { status: 400 })
      }

      // Utiliser le service role client pour insérer la transaction
      const supabaseServiceClient = createServiceRoleClient()

      // Créer la transaction de type 'credit'
      const { data: transaction, error: transactionError } = await supabaseServiceClient
        .from('transactions')
        .insert({
          user_id: userId,
          amount: amountEuros,
          type: 'credit',
          request_id: null // null pour les recharges
        })
        .select()
        .single()

      if (transactionError) {
        console.error('Error creating transaction:', transactionError)
        return NextResponse.json(
          { message: 'Error creating transaction', error: transactionError.message },
          { status: 500 }
        )
      }

      console.log('Payment processed successfully:', {
        transactionId: transaction.id,
        userId,
        amount: amountEuros,
      })

      return NextResponse.json({ 
        message: 'Payment processed successfully',
        transactionId: transaction.id 
      })
    }

    // Autres événements ignorés
    console.log('Unhandled webhook event:', event.type)
    return NextResponse.json({ message: 'Event received' })

  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { message: 'Webhook error', error: error.message },
      { status: 500 }
    )
  }
}
