"use client";

import React, { useState, useEffect } from "react";
import SignOut from "./sign-out";
import { signInWithGoogleFirebase } from "../../../library/firebase";

const User = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("streamvault_user");
      if (stored) setUser(JSON.parse(stored));
    } catch {}

    const handleAuth = () => {
      try {
        const stored = localStorage.getItem("streamvault_user");
        setUser(stored ? JSON.parse(stored) : null);
      } catch {}
    };

    window.addEventListener("storage", handleAuth);
    window.addEventListener("streamvault-auth", handleAuth);
    return () => {
      window.removeEventListener("storage", handleAuth);
      window.removeEventListener("streamvault-auth", handleAuth);
    };
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      const firebaseResult = await signInWithGoogleFirebase();
      const u = {
        name: firebaseResult.user?.name || "Google Viewer",
        email: firebaseResult.user?.email || "viewer@streamvault.local",
        image: firebaseResult.user?.photoURL || undefined,
        tier: "FREE",
      };
      localStorage.setItem("streamvault_user", JSON.stringify(u));
      setUser(u);
      window.dispatchEvent(new CustomEvent("streamvault-auth", { detail: u }));
    } catch (e) {
      console.warn("Google signin fallback", e);
    }
  };

  const handleUpgradeVip = () => {
    const upgraded = {
      ...(user || { name: "VIP Master", email: "vip@streamvault.local" }),
      tier: "PREMIUM",
    };
    localStorage.setItem("streamvault_user", JSON.stringify(upgraded));
    setUser(upgraded);
    window.dispatchEvent(new CustomEvent("streamvault-auth", { detail: upgraded }));
  };

  const isVip = user?.tier === "PREMIUM";
  const displayName = user?.name || "Guest Viewer";
  const displayEmail = user?.email || "Explore free streaming with standard 720p HD";

  return (
    <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative h-14 w-14 flex-none overflow-hidden rounded-full border-2 border-slate-700 bg-slate-800 flex items-center justify-center font-bold text-lg text-slate-200">
            {user?.image ? (
              <div
                style={{ backgroundImage: `url(${user.image})` }}
                className="w-full h-full bg-cover bg-center"
              />
            ) : (
              <span>{displayName.slice(0, 2).toUpperCase()}</span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <strong className="text-lg sm:text-xl text-white">{displayName}</strong>
              {isVip ? (
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  VIP Premium
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                  {user ? "Free Member (With Ads)" : "Guest Explorer"}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">{displayEmail}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {!user ? (
            <button
              onClick={handleGoogleSignIn}
              className="px-4 py-2.5 rounded-xl bg-white text-slate-950 font-semibold text-xs hover:bg-slate-100 transition shadow cursor-pointer active:scale-95"
            >
              Sign In with Google
            </button>
          ) : (
            <SignOut />
          )}
          {!isVip && (
            <button
              onClick={handleUpgradeVip}
              className="px-3.5 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium text-xs transition cursor-pointer active:scale-95"
            >
              Get VIP ($12/mo)
            </button>
          )}
        </div>
      </div>

      {/* Plan Details & Features */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800 text-xs">
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
          <span className="text-slate-400 block text-[11px]">Stream Quality</span>
          <span className="font-semibold text-slate-100 text-sm">
            {isVip ? "1080p & 4K Ultra-HD" : "720p HD"}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
          <span className="text-slate-400 block text-[11px]">Ad-Free Experience</span>
          <span className={`font-semibold text-sm ${isVip ? "text-emerald-400" : "text-slate-300"}`}>
            {isVip ? "Ad-Free Unlocked" : "Standard (With Ads)"}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
          <span className="text-slate-400 block text-[11px]">In-App Offline Download</span>
          <span className={`font-semibold text-sm ${isVip ? "text-blue-400" : "text-slate-400"}`}>
            {isVip ? "AES-256 Storage Ready" : "VIP Feature Only"}
          </span>
        </div>
      </div>
    </section>
  );
};

export default User;
