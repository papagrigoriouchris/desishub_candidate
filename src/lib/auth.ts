// Σχόλιο (GR): Κοινό σημείο για έλεγχο session (server-side)
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "ADMIN") {
    throw new Error("Ανεπαρκή δικαιώματα");
  }
  return session;
}
