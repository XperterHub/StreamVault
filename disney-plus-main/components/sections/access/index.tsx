"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { signInWithGoogleFirebase } from "../../../library/firebase";
import { 
  SparklesIcon, 
  TagIcon, 
  ShieldCheckIcon,
  PlayCircleIcon,
  LanguageIcon,
  ArrowDownTrayIcon
} from "@heroicons/react/24/outline";

const Access = () => {
  const [email, setEmail] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"google" | "guest">("google");

  const handleViewerSignIn = async (tier: "FREE" | "PREMIUM") => {
    setLoading(true);
    const guestUser = {
      name: tier === "PREMIUM" ? "VIP Master" : (email ? email.split("@")[0] : "Free Viewer"),
      email: email.trim() || (tier === "PREMIUM" ? "vip_viewer@streamvault.local" : "free_viewer@streamvault.local"),
      tier: tier,
    };
    if (typeof window !== "undefined") {
      localStorage.setItem("streamvault_user", JSON.stringify(guestUser));
      window.dispatchEvent(new Event("storage"));
    }
    try {
      await signIn("credentials", {
        ...guestUser,
        couponCode: couponCode.trim(),
        redirect: false,
      });
    } catch {
      // In static hosting environments next-auth api might not run; localStorage handles state
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      // 1. Google Authentication via Firebase Auth
      const firebaseResult = await signInWithGoogleFirebase();
      const userEmail = firebaseResult.user?.email || "google.viewer@gmail.com";
      const userName = firebaseResult.user?.name || "Google Viewer";

      const googleUser = {
        name: userName,
        email: userEmail,
        tier: "FREE",
      };
      if (typeof window !== "undefined") {
        localStorage.setItem("streamvault_user", JSON.stringify(googleUser));
        window.dispatchEvent(new Event("storage"));
      }

      // 2. Try NextAuth if server available
      try {
        await signIn("credentials", {
          email: userEmail,
          name: userName,
          tier: "FREE",
          redirect: false,
        });
      } catch {}
    } catch (err) {
      console.warn("Fallback to client Google session", err);
      const fallbackUser = {
        name: "Google Viewer",
        email: email.trim() || "google.viewer@gmail.com",
        tier: "FREE",
      };
      if (typeof window !== "undefined") {
        localStorage.setItem("streamvault_user", JSON.stringify(fallbackUser));
        window.dispatchEvent(new Event("storage"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto mb-16 w-full max-w-lg space-y-7 px-4 sm:px-6 relative z-20">
      {/* Brand Header */}
      <div className="text-center space-y-3">
        <div className="relative mx-auto aspect-video w-44 sm:w-52 drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)]">
          <Image
            src="/assets/images/disney-plus-logo.png"
            alt="StreamVault Logo"
            fill
            sizes="500px"
            priority
            className="object-contain"
          />
        </div>

        <div className="space-y-1">
          <h1 className="font-extrabold text-2xl sm:text-3xl text-slate-100 tracking-tight">
            Stream in Any Language
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
            Multi-audio master streaming with Google Drive, real-time forensic protection, and in-app offline vaults.
          </p>
        </div>
      </div>

      {/* Main Glass Card */}
      <div className="bg-slate-900/95 border border-slate-800/90 rounded-2xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl space-y-6 ring-1 ring-white/5">
        
        {/* Google Authentication Button */}
        <div>
          <button
            type="button"
            disabled={loading}
            onClick={handleGoogleSignIn}
            className="w-full py-3.5 px-4 rounded-xl bg-white text-slate-900 font-semibold text-xs sm:text-sm hover:bg-slate-100 active:scale-[0.99] transition-all flex items-center justify-center gap-3 shadow-lg border border-slate-200 cursor-pointer disabled:opacity-60 group"
          >
            <svg className="w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-105" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{loading ? "Authenticating with Google..." : "Continue with Google"}</span>
          </button>
        </div>

        {/* Subtle Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-800/80" />
          <span className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">Or explore tiers</span>
          <div className="flex-1 h-px bg-slate-800/80" />
        </div>

        {/* Email & Coupon */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Guest Email Address (Optional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="viewer@streamvault.com"
              className="w-full bg-slate-950/80 border border-slate-800 focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/30 focus:outline-none rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 transition-all"
            />
          </div>

          {/* Promo Code Accordion */}
          {showCouponInput ? (
            <div className="p-3.5 bg-slate-950 border border-blue-500/30 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-blue-400 flex items-center gap-1.5">
                  <TagIcon className="w-3.5 h-3.5" />
                  <span>VIP Promo / Passcode</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowCouponInput(false)}
                  className="text-[11px] text-slate-400 hover:text-slate-200"
                >
                  Hide
                </button>
              </div>
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="e.g. VIPPASS, STREAM100"
                className="w-full bg-slate-900 border border-slate-700/80 focus:border-blue-500 focus:outline-none rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 font-mono uppercase"
              />
            </div>
          ) : (
            <div className="flex items-center justify-between text-xs pt-0.5">
              <span className="text-slate-400 text-[11px]">Have an invite or VIP coupon?</span>
              <button
                type="button"
                onClick={() => setShowCouponInput(true)}
                className="text-[11px] text-blue-400 hover:text-blue-300 font-medium cursor-pointer"
              >
                + Redeem Coupon
              </button>
            </div>
          )}
        </div>

        {/* Plan Tiers Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
          {/* Free Tier Card */}
          <button
            type="button"
            disabled={loading}
            onClick={() => handleViewerSignIn("FREE")}
            className="p-4 rounded-xl bg-slate-950/90 border border-slate-800/80 hover:border-slate-700 text-left transition-all duration-200 hover:-translate-y-0.5 group flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-xs text-slate-200">Standard Access</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700/60 font-medium">720p HD</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">Ad-supported streaming with multi-language audio tracks.</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-300 font-medium group-hover:text-white transition-colors">
              <span>Start Watching</span>
              <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
            </div>
          </button>

          {/* VIP Premium Tier Card */}
          <button
            type="button"
            disabled={loading}
            onClick={() => handleViewerSignIn("PREMIUM")}
            className="p-4 rounded-xl bg-gradient-to-b from-blue-950/40 to-slate-950/90 border border-blue-500/40 hover:border-blue-400/80 text-left transition-all duration-200 hover:-translate-y-0.5 group flex flex-col justify-between relative overflow-hidden cursor-pointer"
          >
            <div className="absolute top-0 right-0 px-2 py-0.5 bg-blue-600 text-[9px] font-bold text-white rounded-bl-lg uppercase tracking-wider">
              VIP Tier
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <SparklesIcon className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-semibold text-xs text-white">VIP Master</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">100% Ad-Free, 1080p & 4K HDR, plus in-app offline download vaults.</p>
            </div>
            <div className="mt-4 pt-3 border-t border-blue-500/20 flex items-center justify-between text-xs text-blue-300 font-medium group-hover:text-blue-100 transition-colors">
              <span>{couponCode ? "Unlock VIP" : "Start VIP Access"}</span>
              <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
            </div>
          </button>
        </div>

        {/* Security & Feature Badges */}
        <div className="pt-3 border-t border-slate-800/70 grid grid-cols-3 gap-2 text-center text-[10px] text-slate-400">
          <span className="flex items-center justify-center gap-1">
            <ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> AES-256
          </span>
          <span className="flex items-center justify-center gap-1">
            <LanguageIcon className="w-3.5 h-3.5 text-blue-400 shrink-0" /> Multi-Audio
          </span>
          <span className="flex items-center justify-center gap-1">
            <ArrowDownTrayIcon className="w-3.5 h-3.5 text-slate-300 shrink-0" /> Offline Vault
          </span>
        </div>
      </div>
    </section>
  );
};

export default Access;
