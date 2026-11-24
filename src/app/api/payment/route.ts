import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-10-29.clover',
});

export async function POST(req: NextRequest) {
    try {
        const { amount, currency = 'tnd', productName } = await req.json();

        // Create a PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 1000), // Convert to millimes (TND smallest unit)
            currency: currency.toLowerCase(),
            metadata: {
                productName: productName || 'Club Africain Purchase',
            },
        });

        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error: any) {
        console.error('Payment Intent Error:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
