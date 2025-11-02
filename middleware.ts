// Σχόλιο (GR): Προστατεύουμε /admin με έλεγχο session role μέσω NextAuth
import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      const isAdmin = token && (token as any).role === "admin";
      if (req.nextUrl.pathname.startsWith("/admin")) return !!isAdmin;
      return true;
    },
  },
});

export const config = {
  matcher: ["/admin/:path*"],
};
