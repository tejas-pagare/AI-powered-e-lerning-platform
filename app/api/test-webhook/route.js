import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { usersTable } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { SUBSCRIPTION_PLANS } from "@/config/subscriptions";

export async function GET(req) {
    try {
        console.log('=== Testing Database Update ===');
        
        // Get all users
        const users = await db.select().from(usersTable);
        console.log('Users in database:', users);
        
        // Get subscription plans
        console.log('Subscription plans:', SUBSCRIPTION_PLANS);
        
        return NextResponse.json({
            success: true,
            users: users.map(u => ({
                id: u.id,
                email: u.email,
                tier: u.tier,
                credits: u.credits,
                stripePriceId: u.stripePriceId
            })),
            plans: SUBSCRIPTION_PLANS
        });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const { userId, tier, credits } = await req.json();
        
        console.log(`Testing update for user ${userId} to ${tier} with ${credits} credits`);
        
        const result = await db.update(usersTable).set({
            tier: tier,
            credits: credits,
        }).where(eq(usersTable.id, parseInt(userId))).returning();
        
        console.log('Update result:', result);
        
        return NextResponse.json({
            success: true,
            result: result[0]
        });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
