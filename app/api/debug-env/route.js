import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({
        hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
        webhookSecretPrefix: process.env.STRIPE_WEBHOOK_SECRET?.substring(0, 10),
        hasStripeSecretKey: !!process.env.STRIPE_SECRET_KEY,
        hasProPriceId: !!process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO,
        proPriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO,
        hasEnterprisePriceId: !!process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE,
        enterprisePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE,
    });
}
