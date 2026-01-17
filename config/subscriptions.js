export const CREDITS_PER_COURSE = 5;

export const SUBSCRIPTION_PLANS = [
    {
        name: "Free",
        price: 0,
        credits: 5, // 1 course
        stripePriceId: null,
    },
    {
        name: "Pro",
        price: 10,
        credits: 30, // 6 courses
        stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO,
    },
    {
        name: "Enterprise",
        price: 30,
        credits: 125, // 25 courses
        stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE,
    },
];
