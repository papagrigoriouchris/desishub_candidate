// Σχόλιο (GR): Προστατεύουμε /admin με έλεγχο session role μέσω NextAuth
import { withAuth } from "next-auth/middleware";
import type { DefaultJWT } from "next-auth/jwt";

export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      const role =
        token && typeof token === "object"
          ? (token as DefaultJWT & { role?: string }).role
          : undefined;
      const isAdmin = role === "admin";
      if (req.nextUrl.pathname.startsWith("/admin")) return !!isAdmin;
      return true;
    },
  },
});

export const config = {
  matcher: ["/admin/:path*"],
};
