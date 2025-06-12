import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

// Fonction pour récupérer le taux de change EUR/USD en temps réel
async function getEURToUSDRate(): Promise<number> {
  try {
    // Utilisation de l'API Exchange Rates
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/EUR')
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    const rate = data.rates.USD
    
    if (!rate || typeof rate !== 'number') {
      throw new Error('Invalid exchange rate data')
    }
    
    console.log(`Current EUR to USD rate: ${rate}`)
    return rate
    
  } catch (error) {
    console.error('Error fetching exchange rate:', error)
    // Fallback sur un taux fixe en cas d'erreur
    const fallbackRate = 1.05 // Taux approximatif EUR/USD
    console.log(`Using fallback rate: ${fallbackRate}`)
    return fallbackRate
  }
}

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

      const userId = paymentIntent.metadata?.user_id
      const currency = paymentIntent.currency.toLowerCase()
      const originalAmount = paymentIntent.amount

      if (!userId || originalAmount <= 0) {
        console.error('Invalid payment data:', { userId, originalAmount, paymentIntentId: paymentIntent.id })
        return NextResponse.json({ message: 'Invalid payment data' }, { status: 200 })
      }

      // Convertir en USD selon la devise
      let amountInUSD: number
      let exchangeRate: number = 1
      
      if (currency === 'eur') {
        // Récupérer le taux de change en temps réel
        exchangeRate = await getEURToUSDRate()
        amountInUSD = originalAmount * exchangeRate
        console.log(`Converting EUR to USD: ${originalAmount} EUR * ${exchangeRate} = ${amountInUSD} USD`)
      } else if (currency === 'usd') {
        amountInUSD = originalAmount
        console.log(`Already in USD: ${originalAmount} USD`)
      } else {
        console.error('Unsupported currency:', currency)
        return NextResponse.json({ message: 'Unsupported currency' }, { status: 200 })
      }

      // Utiliser le service role client pour insérer la transaction
      const supabaseServiceClient = createServiceRoleClient()

      // Créer la transaction en USD uniquement
      const { data: transaction, error: transactionError } = await supabaseServiceClient
        .from('transactions')
        .insert({
          user_id: userId,
          amount: amountInUSD / 100, // Convertir en dollars
          type: 'credit',
          request_id: null // null pour les recharges
        })
        .select()
        .single()

      if (transactionError) {
        console.error('Error creating transaction:', {
          error: transactionError,
          paymentIntentId: paymentIntent.id,
          userId,
          originalAmount,
          currency,
          amountInUSD,
          exchangeRate
        })
        return NextResponse.json(
          { message: 'Error creating transaction', error: transactionError.message },
          { status: 500 }
        )
      }

      console.log('Payment processed successfully:', {
        transactionId: transaction.id,
        paymentIntentId: paymentIntent.id,
        userId,
        originalAmount,
        originalCurrency: currency,
        amountInUSD,
        exchangeRate: currency === 'eur' ? exchangeRate : 1,
        timestamp: new Date().toISOString()
      })

      return NextResponse.json({ 
        message: 'Payment processed successfully',
        transactionId: transaction.id,
        amountInUSD,
        exchangeRate: currency === 'eur' ? exchangeRate : 1
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