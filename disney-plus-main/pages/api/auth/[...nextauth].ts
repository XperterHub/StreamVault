import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET || "streamvault_secret_key_12345",
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "StreamVault Viewer Account",
      credentials: {
        email: { label: "Email", type: "email" },
        tier: { label: "Tier", type: "text" },
        couponCode: { label: "Coupon Code", type: "text" }
      },
      async authorize(credentials) {
        const email = credentials?.email || "viewer@streamvault.internal";
        const tier = credentials?.tier || (credentials?.couponCode ? "PREMIUM" : "FREE");
        return {
          id: "usr-" + Math.floor(1000 + Math.random() * 9000),
          name: email.split("@")[0],
          email: email,
          tier: tier
        };
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID || "sample_google_id",
      clientSecret: process.env.GOOGLE_SECRET || "sample_google_secret",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id;
        token.tier = (user as any).tier || "FREE";
      }
      if (account?.provider === "google") {
        token.id = token.id || (profile as any)?.sub || "usr-" + Math.floor(1000 + Math.random() * 9000);
        token.tier = token.tier || "FREE";
        if ((profile as any)?.picture) token.picture = (profile as any).picture;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id || token.sub || "usr-viewer";
        (session.user as any).tier = token.tier || "FREE";
        if (token.picture) session.user.image = token.picture as string;
      }
      return session;
    }
  },
};

export default NextAuth(authOptions);
