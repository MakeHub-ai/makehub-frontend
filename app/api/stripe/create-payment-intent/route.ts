import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: NextRequest) {
  try {
    // Authentification utilisateur
    const supabaseAuthClient = await createServerSupabaseClient()
    
    const { data: { session }, error: sessionError } = await supabaseAuthClient.auth.getSession()

    if (sessionError) {
      console.error('Error getting session:', sessionError)
      return NextResponse.json({ message: 'Error getting session', error: sessionError.message }, { status: 500 })
    }

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized: User not authenticated' }, { status: 401 })
    }

    const { amount, currency = 'eur' } = await request.json()

    // Validation du montant
    if (!amount || amount <= 0) {
      return NextResponse.json({ message: 'Invalid amount' }, { status: 400 })
    }

    // Validation de la devise
    if (!['eur', 'usd'].includes(currency.toLowerCase())) {
      return NextResponse.json({ message: 'Invalid currency. Only EUR and USD are supported.' }, { status: 400 })
    }

    const normalizedCurrency = currency.toLowerCase()

    // Convertir en centimes pour Stripe
    const amountInCents = Math.round(amount * 100)

    // Créer le PaymentIntent avec metadata
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: normalizedCurrency,
      metadata: {
        user_id: session.user.id,
        amount: amount.toString(),
        currency: normalizedCurrency
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    })

  } catch (error: any) {
    console.error('Error creating payment intent:', error)
    return NextResponse.json(
      { message: 'Error creating payment intent', error: error.message },
      { status: 500 }
    )
  }
}
