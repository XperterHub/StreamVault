import "../styles/globals.css";
import type { ReactNode } from "react";
import { Inter } from "@next/font/google";
import useAuth from "../hooks/use-auth";
import Providers from "../components/providers";
import ClientShell from "../components/layouts/shell";

const inter = Inter({
  subsets: ["latin"],
});

type Props = {
  children: ReactNode;
};

const Layout = async ({ children }: Props) => {
  const { session } = await useAuth();

  return (
    <html lang="en" className="bg-background-dark text-typography-light">
      <head />
      <body className={inter.className}>
        <Providers>
          <ClientShell initialSession={session}>
            {children}
          </ClientShell>
        </Providers>
      </body>
    </html>
  );
};

export default Layout;
