'use client';

import { Button } from "@/components/ui/button";
import { SUBSCRIPTION_PLANS, CREDITS_PER_COURSE } from "@/config/subscriptions";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { Check, X, Loader2, Sparkles, CreditCard, Zap, ShieldCheck } from "lucide-react";
import React, { useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { userContextProvider } from "@/context/userContext";
import { useSearchParams } from "next/navigation";

const PLAN_FEATURES = {
  Free: [
    { text: "5 Credits / Month", included: true },
    { text: "1 AI Generated Course", included: true },
    { text: "Basic AI Generation", included: true },
    { text: "Standard Support", included: true },
    { text: "No PDF Export", included: false },
    { text: "No Team Access", included: false },
  ],
  Pro: [
    { text: "30 Credits / Month", included: true },
    { text: "6 AI Generated Courses", included: true },
    { text: "Advanced AI Generation", included: true },
    { text: "Priority Email Support", included: true },
    { text: "PDF Export Enabled", included: true },
    { text: "Ad-free Experience", included: true },
  ],
  Enterprise: [
    { text: "125 Credits / Month", included: true },
    { text: "25 AI Generated Courses", included: true },
    { text: "Ultra-fast AI Generation", included: true },
    { text: "24/7 Priority Support", included: true },
    { text: "Full Team Collaboration", included: true },
    { text: "Custom Branding", included: true },
  ]
};

const PLAN_ICONS = {
  Free: <Zap className="w-10 h-10 text-gray-400" />,
  Pro: <Sparkles className="w-10 h-10 text-blue-500" />,
  Enterprise: <ShieldCheck className="w-10 h-10 text-purple-600" />
};

export default function BillingPage() {
  const { user } = useUser();
  const { userDetails, refreshUserDetails } = useContext(userContextProvider);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    // Refresh user details when page loads or when coming back from checkout
    if (user) {
      refreshUserDetails();
    }
    
    // Show success message if redirected from successful checkout
    if (searchParams.get('success') === 'true') {
      toast.success("Payment Successful!", {
        description: "Your subscription has been updated!",
        icon: <Sparkles className="h-5 w-5 text-yellow-500" />,
      });
    }
  }, [user, searchParams]);

  const onPayment = async (plan) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/create-checkout-session', {
        priceId: plan.stripePriceId,
        planName: plan.name
      });

      if (response.data && response.data.url) {
        window.location.assign(response.data.url);
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-10 bg-gray-50/50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
            Choose Your Learning Journey
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Upgrade to unlock more courses, premium features, and priority assistance.
          </p>
          {userDetails && (
            <div className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-blue-50 border border-blue-200 rounded-full">
              <span className="text-sm font-semibold text-blue-700">Current Plan:</span>
              <span className="text-sm font-bold text-blue-900">{userDetails.tier}</span>
              <span className="text-sm text-blue-600">•</span>
              <span className="text-sm font-semibold text-blue-700">{userDetails.credits} Credits</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {SUBSCRIPTION_PLANS.map((plan, index) => {
            const isPro = plan.name === 'Pro';
            const features = PLAN_FEATURES[plan.name];

            return (
              <div
                key={index}
                className={`flex flex-col relative p-8 bg-white rounded-3xl transition-all duration-300 hover:shadow-2xl border ${isPro ? 'border-blue-500 shadow-xl ring-4 ring-blue-500/10 scale-105' : 'border-gray-100 shadow-sm'
                  }`}
              >
                {isPro && (
                  <div className="absolute top-0 right-10 -translate-y-1/2 bg-blue-500 text-white px-4 py-1.5 rounded-full text-sm font-bold tracking-wide uppercase">
                    Most Popular
                  </div>
                )}

                <div className="mb-8 flex justify-center">
                  {PLAN_ICONS[plan.name]}
                </div>

                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">{plan.name}</h2>
                  <div className="mt-4 flex items-baseline text-gray-900">
                    <span className="text-5xl font-extrabold tracking-tight">${plan.price}</span>
                    <span className="ml-1 text-xl font-semibold text-gray-500">/mo</span>
                  </div>
                  <p className="mt-2 text-gray-500 font-medium">
                    {plan.name === 'Free' ? 'Perfect for trying things out' : isPro ? 'Best for serious learners' : 'For organizations & power users'}
                  </p>
                </div>

                <div className="flex-1 space-y-4">
                  {features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-green-500 shrink-0" />
                      ) : (
                        <X className="w-5 h-5 text-gray-300 shrink-0" />
                      )}
                      <span className={`text-sm ${feature.included ? 'text-gray-700' : 'text-gray-400 line-through'}`}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-10">
                  {plan.name === userDetails?.tier ? (
                    <Button
                      className="w-full py-6 text-lg font-bold rounded-2xl border-2 border-gray-100 text-gray-400 cursor-not-allowed"
                      variant="outline"
                      disabled
                    >
                      Current Plan
                    </Button>
                  ) : plan.price > 0 ? (
                    <Button
                      className={`w-full py-6 text-lg font-bold rounded-2xl transition-all ${isPro ? 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30' : 'bg-gray-900 hover:bg-gray-800'
                        }`}
                      onClick={() => onPayment(plan)}
                      disabled={loading}
                    >
                      {loading ? <Loader2 className="animate-spin w-6 h-6" /> : (
                        <span className="flex items-center gap-2">
                          <CreditCard className="w-5 h-5" />
                          Subscribe Now
                        </span>
                      )}
                    </Button>
                  ) : (
                    <Button
                      className="w-full py-6 text-lg font-bold rounded-2xl border-2 border-gray-100 text-gray-400 cursor-not-allowed"
                      variant="outline"
                      disabled
                    >
                      Current Plan
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-20 p-8 rounded-3xl bg-blue-50/50 border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-blue-100 rounded-2xl">
              <Zap className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Need more credits?</h3>
              <p className="text-gray-600">Upgrade to a higher plan for more course generations every month.</p>
            </div>
          </div>
          <p className="text-sm font-semibold text-blue-600 bg-blue-100/50 px-4 py-2 rounded-lg">
            5 Credits = 1 Full Course
          </p>
        </div>
      </div>
    </div>
  )
}
