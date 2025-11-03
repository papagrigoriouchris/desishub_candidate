// Σχόλιο (GR): Ρυθμίσεις NextAuth με PrismaAdapter, Google & Credentials
import type { DefaultSession, NextAuthOptions, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

type Role = "admin" | "user";

type AppUser = User & { id: string; role?: Role };
type TokenWithRole = JWT & { role?: Role };
type SessionWithRole = DefaultSession & {
  user: DefaultSession["user"] & { role: Role };
};

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
        if (!ok) return null;
        const role =
          user.role?.toLowerCase() === "admin" ? ("admin" as Role) : "user";
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Σχόλιο (GR): Περνάμε το role στο JWT για εύκολο έλεγχο
      const tokenWithRole = token as TokenWithRole;
      if (user) tokenWithRole.role = (user as AppUser).role ?? "admin";
      return tokenWithRole;
    },
    async session({ session, token }) {
      // Σχόλιο (GR): Περνάμε το role και στο session object
      const sessionWithRole = session as SessionWithRole;
      const tokenWithRole = token as TokenWithRole;
      sessionWithRole.user = {
        ...(sessionWithRole.user ?? {}),
        role: tokenWithRole.role ?? "admin",
      };
      return sessionWithRole;
    },
  },
  pages: {
    signIn: "/signin", // Σχόλιο (GR): custom σελίδα σύνδεσης
  },
};
