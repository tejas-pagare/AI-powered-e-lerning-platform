import { db } from "@/lib/db";
import { usersTable } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";


export async function POST(req) {
  try {
    const { email, name } = await req.json();
    if (!email || !name) {
      return NextResponse.json(
        { error: "Email and name are required." },
        { status: 400 }
      );
    }
    // if user exists - explicitly select only existing columns
    const user = await db.select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      tier: usersTable.tier,
      credits: usersTable.credits,
      stripeCustomerId: usersTable.stripeCustomerId,
      stripeSubscriptionId: usersTable.stripeSubscriptionId,
      stripePriceId: usersTable.stripePriceId,
      stripeCurrentPeriodEnd: usersTable.stripeCurrentPeriodEnd,
    }).from(usersTable).where(eq(usersTable.email, email));

    if (user?.length === 0) {
      const result = await db.insert(usersTable).values({
        name,
        email
      }).returning({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        tier: usersTable.tier,
        credits: usersTable.credits,
        stripeCustomerId: usersTable.stripeCustomerId,
        stripeSubscriptionId: usersTable.stripeSubscriptionId,
        stripePriceId: usersTable.stripePriceId,
        stripeCurrentPeriodEnd: usersTable.stripeCurrentPeriodEnd,
      });

      return NextResponse.json(result[0]);
    }

    return NextResponse.json(user[0]);
  } catch (error) {
    console.error("Error in POST /api/user:", error);
    return NextResponse.json({
      error: "Internal Server Error"
    })
  }


}