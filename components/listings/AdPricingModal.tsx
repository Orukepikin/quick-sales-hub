"use client";

import { useState } from "react";
import { X, Check, Zap, TrendingUp, Star, Crown } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface AdPricingModalProps {
  onSelect: (plan: string) => void;
  onClose: () => void;
}

const PLANS = [
  {
    id: "free",
    name: "Free Listing",
    price: 0,
    duration: "30 days",
    icon: Check,
    color: "border-gray-300",
    features: [
      "Basic listing in marketplace",
      "Up to 5 photos",
      "In-app chat with buyers",
      "WhatsApp contact button",
    ],
    missing: [
      "No featured badge",
      "No priority placement",
      "No analytics",
    ],
    badge: null,
  },
  {
    id: "standard",
    name: "Standard Boost",
    price: 500,
    duration: "7 days",
    icon: Zap,
    color: "border-brand-blue",
    popular: true,
    features: [
      "Everything in Free",
      "Up to 10 photos",
      "FEATURED badge on listing",
      "Priority in search results",
      "Basic analytics (views, saves)",
    ],
    missing: [
      "No homepage spotlight",
    ],
    badge: "Most Popular",
  },
  {
    id: "premium",
    name: "Premium Spotlight",
    price: 2000,
    duration: "14 days",
    icon: Crown,
    color: "border-brand-yellow",
    features: [
      "Everything in Standard",
      "Homepage featured section",
      "Top of category listing",
      "Detailed analytics & insights",
      "Priority customer support",
      "Shareable promoted link",
    ],
    missing: [],
    badge: "Best Value",
  },
  {
    id: "mega",
    name: "Mega Boost",
    price: 5000,
    duration: "30 days",
    icon: TrendingUp,
    color: "border-purple-500",
    features: [
      "Everything in Premium",
      "30 days of promotion",
      "Social media feature (Instagram, Twitter)",
      "Push notification to nearby buyers",
      "Dedicated account manager",
      "Guaranteed minimum 1,000 views",
    ],
    missing: [],
    badge: "Maximum Exposure",
  },
];

export default function AdPricingModal({ onSelect, onClose }: AdPricingModalProps) {
  const [selected, setSelected] = useState("free");

  return (
    <div className="fixed inset-0 bg-black/50 z-[250] flex items-center justify-center p-3 sm:p-5 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-[780px] w-full max-h-[92vh] overflow-y-auto animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="p-5 sm:p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-gray-900">Choose Your Ad Plan</h2>
            <p className="text-sm text-gray-500 mt-1">Boost your listing to sell faster</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {PLANS.map(plan => (
              <div key={plan.id} onClick={() => setSelected(plan.id)}
                className={`rounded-2xl border-2 p-5 cursor-pointer transition-all relative ${
                  selected === plan.id ? `${plan.color} bg-gray-50 shadow-md` : "border-gray-200 hover:border-gray-300"
                }`}>
                {plan.badge && (
                  <div className={`absolute -top-2.5 left-4 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    plan.popular ? "bg-brand-blue text-white" : "bg-brand-yellow text-gray-900"
                  }`}>
                    {plan.badge}
                  </div>
                )}

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <plan.icon size={20} className={selected === plan.id ? "text-brand-blue" : "text-gray-400"} />
                    <h3 className="font-display font-bold text-base">{plan.name}</h3>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selected === plan.id ? "border-brand-blue bg-brand-blue" : "border-gray-300"
                  }`}>
                    {selected === plan.id && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                </div>

                <div className="mb-3">
                  <span className="font-display text-2xl font-extrabold text-gray-900">
                    {plan.price === 0 ? "Free" : formatPrice(plan.price)}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">/ {plan.duration}</span>
                </div>

                <div className="flex flex-col gap-1.5">
                  {plan.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-gray-700">
                      <Check size={14} className="text-green-500 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                  {plan.missing.map((f, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-gray-400">
                      <X size={14} className="shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button onClick={() => onSelect(selected)}
            className="w-full py-4 bg-brand-blue text-white rounded-xl font-display font-bold text-base hover:bg-brand-blue-dark transition-all">
            {selected === "free" ? "Post Free Ad" : `Pay ${formatPrice(PLANS.find(p => p.id === selected)?.price || 0)} & Post Ad`}
          </button>

          <p className="text-center text-xs text-gray-400 mt-3">
            {selected !== "free" ? "Payment processed securely via Paystack. You can upgrade anytime." : "You can boost your listing anytime after posting."}
          </p>
        </div>
      </div>
    </div>
  );
}
