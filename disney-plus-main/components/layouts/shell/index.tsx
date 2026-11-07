"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Navbar from "../../sections/navbar";
import Access from "../../sections/access";
import Image from "next/image";
import { auth } from "../../../library/firebase";
import { onAuthStateChanged } from "firebase/auth";

type Props = {
  children: React.ReactNode;
  initialSession?: any;
};

export default function ClientShell({ children, initialSession }: Props) {
  const { data: session } = useSession();
  const [localUser, setLocalUser] = useState<any>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("streamvault_user");
        return stored ? JSON.parse(stored) : null;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const handleStorageChange = () => {
      try {
        const stored = localStorage.getItem("streamvault_user");
        setLocalUser(stored ? JSON.parse(stored) : null);
      } catch {
        setLocalUser(null);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Also listen to Firebase Auth changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const u = {
          name: firebaseUser.displayName || "Google Viewer",
          email: firebaseUser.email || "viewer@streamvault.local",
          image: firebaseUser.photoURL || undefined,
          tier: "FREE",
        };
        localStorage.setItem("streamvault_user", JSON.stringify(u));
        setLocalUser(u);
      }
    });

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      unsubscribe();
    };
  }, []);

  const isAuthenticated = !!session?.user || !!localUser || !!initialSession?.user;

  // Before hydration, render children if server session, else access screen
  if (!mounted) {
    if (initialSession?.user) {
      return (
        <div className="grid tablet:grid-cols-[auto,1fr] min-h-screen bg-background-dark text-typography-light">
          <aside className="hidden tablet:block">
            <Navbar.Vertical />
          </aside>
          <main className="min-h-screen overflow-hidden tablet:overflow-visible pb-20 tablet:pb-0">
            {children}
          </main>
          <Navbar.Horizontal />
        </div>
      );
    }

    return (
      <main className="relative grid min-h-screen w-screen items-center bg-background-dark overflow-x-hidden">
        <div className="fixed inset-0 -z-10 h-full w-full">
          <Image
            src="/assets/images/disney-plus-background.png"
            alt="StreamVault Cinema"
            fill
            sizes="100vw"
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-background-dark via-background-dark/80 to-transparent" />
          <div className="absolute inset-0 z-10 bg-gradient-to-r from-background-dark via-transparent to-background-dark" />
        </div>
        <Access />
      </main>
    );
  }

  // Once mounted in browser:
  if (isAuthenticated) {
    return (
      <div className="grid tablet:grid-cols-[auto,1fr] min-h-screen bg-background-dark text-typography-light selection:bg-blue-600 selection:text-white">
        <aside className="hidden tablet:block">
          <Navbar.Vertical />
        </aside>
        <main className="min-h-screen overflow-hidden tablet:overflow-visible pb-20 tablet:pb-0">
          {children}
        </main>
        <Navbar.Horizontal />
      </div>
    );
  }

  return (
    <main className="relative grid min-h-screen w-screen items-center bg-background-dark overflow-x-hidden">
      <div className="fixed inset-0 -z-10 h-full w-full">
        <Image
          src="/assets/images/disney-plus-background.png"
          alt="StreamVault Cinema"
          fill
          sizes="100vw"
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-background-dark via-background-dark/80 to-transparent" />
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-background-dark via-transparent to-background-dark" />
      </div>
      <Access />
    </main>
  );
}
