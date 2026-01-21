import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { usersTable } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { SUBSCRIPTION_PLANS } from "@/config/subscriptions";

export async function POST(req) {
    console.log('=== Webhook received ===');
    const body = await req.text();
    const signature = (await headers()).get("Stripe-Signature");

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
        console.log(`✓ Webhook verified. Event type: ${event.type}`);
    } catch (error) {
        console.error('✗ Webhook signature verification failed:', error.message);
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    const session = event.data.object;

    console.log('Event data:', JSON.stringify(session, null, 2));

    if (event.type === "checkout.session.completed") {
        console.log('Processing checkout.session.completed event');
        
        // Check if this is a subscription checkout
        if (!session.subscription) {
            console.error('✗ No subscription found in session');
            return new NextResponse("No subscription found in session", { status: 400 });
        }

        console.log(`Session subscription ID: ${session.subscription}`);
        
        try {
            // Retrieve the subscription details to get expiry if needed, or just use priceId
            const subscription = await stripe.subscriptions.retrieve(session.subscription);
            console.log(`✓ Subscription retrieved: ${subscription.id}`);

            const priceId = subscription.items.data[0].price.id;
            console.log(`Price ID: ${priceId}`);
            
            const plan = SUBSCRIPTION_PLANS.find(p => p.stripePriceId === priceId);

            if (!plan) {
                console.error(`✗ No plan found for priceId: ${priceId}`);
                console.log('Available plans:', SUBSCRIPTION_PLANS.map(p => ({ name: p.name, priceId: p.stripePriceId })));
                return new NextResponse(`Plan not found for price ID: ${priceId}`, { status: 400 });
            }

            console.log(`✓ Plan found: ${plan.name}`);

            const credits = plan.credits;
            const tier = plan.name;
            const userId = session.metadata?.userId || subscription.metadata?.userId;

            console.log(`Session metadata:`, session.metadata);
            console.log(`Subscription metadata:`, subscription.metadata);

            if (!userId) {
                console.error('✗ User ID not found in metadata');
                return new NextResponse("User ID not found in metadata", { status: 400 });
            }

            console.log(`✓ User ID found: ${userId}`);
            console.log(`Attempting to upgrade user ${userId} to ${tier} with ${credits} credits`);

            const result = await db.update(usersTable).set({
                stripeCustomerId: subscription.customer,
                stripeSubscriptionId: subscription.id,
                stripePriceId: priceId,
                stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
                tier: tier,
                credits: credits,
            }).where(eq(usersTable.id, parseInt(userId))).returning();

            console.log(`✓ Database update result:`, result);
            console.log(`✓✓✓ User ${userId} successfully upgraded to ${tier} ✓✓✓`);
        } catch (error) {
            console.error('✗ Error processing checkout.session.completed:', error);
            return new NextResponse(`Error: ${error.message}`, { status: 500 });
        }
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
            const priceId = subscription.items.data[0].price.id;
            const plan = SUBSCRIPTION_PLANS.find(p => p.stripePriceId === priceId);
            
            if (!plan) {
                console.error(`No plan found for priceId: ${priceId} during invoice payment`);
                return new NextResponse(`Plan not found for price ID: ${priceId}`, { status: 400 });
            }

            const credits = plan.credits;
            const tier = plan.name;

            console.log(`Refilling credits for user ${user.id} to ${tier} with ${credits} credits`);

            await db.update(usersTable).set({
                stripePriceId: priceId,
                stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
                tier: tier,
                credits: credits // Refill credits
            }).where(eq(usersTable.id, user.id));
        } else {
            console.error('User not found for invoice payment');
            return new NextResponse("User not found", { status: 404 });
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
