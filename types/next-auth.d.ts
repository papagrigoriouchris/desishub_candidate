import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  type Role = "ADMIN" | "USER";

  interface User {
    role: Role;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: Role; // 👈 εδώ δηλώνουμε το role στο session
    };
  }
}

declare module "next-auth/jwt" {
  type Role = "ADMIN" | "USER";
  interface JWT {
    role?: Role; // 👈 και στο JWT
  }
}
