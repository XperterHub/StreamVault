"use client";

import React, { useState, useEffect } from "react";
import Navbar from "../../sections/navbar";

type Props = {
  children: React.ReactNode;
  initialSession?: any;
};

export default function ClientShell({ children }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
