// Σχόλιο (GR): Ρυθμίσεις NextAuth με PrismaAdapter, Google & Credentials
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Κωδικός", type: "password" },
      },
      async authorize(credentials) {
        // Σχόλιο (GR): Βρίσκουμε χρήστη και ελέγχουμε hash κωδικού
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user || !user.passwordHash) return null;
        const ok = await bcrypt.compare(
          credentials.password,
          user.passwordHash,
        );
        return ok
          ? ({
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
            } as any)
          : null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Σχόλιο (GR): Περνάμε το role στο JWT για εύκολο έλεγχο
      if (user) token.role = (user as any).role ?? "admin";
      return token;
    },
    async session({ session, token }) {
      // Σχόλιο (GR): Περνάμε το role και στο session object
      (session as any).user.role = (token as any).role ?? "admin";
      return session;
    },
  },
  pages: {
    signIn: "/signin", // Σχόλιο (GR): custom σελίδα σύνδεσης
  },
};
