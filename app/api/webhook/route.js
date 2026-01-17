import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { usersTable } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { SUBSCRIPTION_PLANS } from "@/config/subscriptions";

export async function POST(req) {
    const body = await req.text();
    const signature = (await headers()).get("Stripe-Signature");

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error) {
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    const session = event.data.object;

    if (event.type === "checkout.session.completed") {
        // Retrieve the subscription details to get expiry if needed, or just use priceId
        // But session has subscription ID.
        const subscription = await stripe.subscriptions.retrieve(session.subscription);

        const plan = SUBSCRIPTION_PLANS.find(p => p.stripePriceId === subscription.items.data[0].price.id);

        const credits = plan ? plan.credits : 5;
        const tier = plan ? plan.name : 'Free';
        const userId = session.metadata?.userId || subscription.metadata?.userId;

        if (!userId) {
            return new NextResponse("User ID not found in metadata", { status: 400 });
        }

        await db.update(usersTable).set({
            stripeCustomerId: subscription.customer,
            stripeSubscriptionId: subscription.id,
            stripePriceId: subscription.items.data[0].price.id,
            stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
            tier: tier,
            credits: credits,
        }).where(eq(usersTable.id, parseInt(userId)));
    }

    if (event.type === "invoice.payment_succeeded") {
        const subscription = await stripe.subscriptions.retrieve(session.subscription);

        // Find the user by metadata userId first, then fallback to stripeSubscriptionId
        const userId = subscription.metadata?.userId;
        let user;
        if (userId) {
            const result = await db.select().from(usersTable).where(eq(usersTable.id, parseInt(userId)));
            user = result[0];
        } else {
            const result = await db.select().from(usersTable).where(eq(usersTable.stripeSubscriptionId, subscription.id));
            user = result[0];
        }

        if (user) {
            const plan = SUBSCRIPTION_PLANS.find(p => p.stripePriceId === subscription.items.data[0].price.id);
            const credits = plan ? plan.credits : 5;
            const tier = plan ? plan.name : 'Free';

            await db.update(usersTable).set({
                stripePriceId: subscription.items.data[0].price.id,
                stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
                tier: tier,
                credits: credits // Refill credits
            }).where(eq(usersTable.id, user.id));
        }
    }

    // Handle downgrade / cancellation
    if (event.type === "customer.subscription.deleted") {
        const subscription = session; // event.data.object is subscription in this case
        const userId = subscription.metadata?.userId;
        let user;
        if (userId) {
            const result = await db.select().from(usersTable).where(eq(usersTable.id, parseInt(userId)));
            user = result[0];
        } else {
            const result = await db.select().from(usersTable).where(eq(usersTable.stripeSubscriptionId, subscription.id));
            user = result[0];
        }

        if (user) {
            await db.update(usersTable).set({
                tier: "Free",
                credits: 5,
            }).where(eq(usersTable.id, user.id));
        }
    }

    return new NextResponse(null, { status: 200 });
}
