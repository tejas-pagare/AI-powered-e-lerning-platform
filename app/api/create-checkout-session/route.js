import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';
import { usersTable } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { currentUser } from '@clerk/nextjs/server';

export async function POST(req) {
    try {
        const { priceId, planName } = await req.json();
        const user = await currentUser();

        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        if (!priceId) {
            return new NextResponse('Missing Price ID', { status: 400 });
        }

        const email = user.emailAddresses[0].emailAddress;
        // Get user from DB to check for stripeCustomerId
        const [dbUser] = await db.select().from(usersTable).where(eq(usersTable.email, email));

        if (!dbUser) {
            // If user doesn't exist in DB yet, create them? 
            // Better to assume they should exist if they reached dashboard.
            return new NextResponse('User not found in database', { status: 404 });
        }

        const host = process.env.NEXT_PUBLIC_HOST_URL || 'http://localhost:3000';

        const sessionConfig = {
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${host}/workspace?success=true`,
            cancel_url: `${host}/workspace/billing?canceled=true`,
            subscription_data: {
                metadata: {
                    userId: dbUser.id.toString(),
                    userEmail: dbUser.email,
                    planName: planName
                }
            },
            metadata: {
                userId: dbUser.id.toString(),
                userEmail: dbUser.email,
                planName: planName
            }
        };

        if (dbUser.stripeCustomerId) {
            sessionConfig.customer = dbUser.stripeCustomerId;
        } else {
            sessionConfig.customer_email = email;
        }

        const session = await stripe.checkout.sessions.create(sessionConfig);

        return NextResponse.json(session);

    } catch (error) {
        console.error('[STRIPE_ERROR]', error);
        return new NextResponse(error.message || 'Internal Error', { status: 500 });
    }
}
