// Σχόλιο (GR): Server component που φέρνει συγκεντρωτικά υποψήφιους & τελευταίο assessment
import { prisma } from "@/lib/prisma";
import AdminTable from "./ui/admin-table";

export const dynamic = "force-dynamic"; // Σχόλιο (GR): Για απλή φρεσκάδα δεδομένων στο dashboard

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { q?: string; tier?: string };
}) {
  const q = searchParams.q?.trim() || "";
  const tier = Number.isFinite(Number(searchParams.tier))
    ? Number(searchParams.tier)
    : undefined;

  // Σχόλιο (GR): Φόρτωση υποψηφίων + τελευταίο assessment (υποθέτουμε 1 assessment/submit)
  const candidates = await prisma.candidate.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        }
      : {},
    orderBy: { createdAt: "desc" },
    include: {
      assessments: { orderBy: { completedAt: "desc" }, take: 1 },
    },
  });

  const rows = candidates
    .map((c: (typeof candidates)[number]) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      createdAt: c.createdAt,
      tier: c.assessments[0]?.computedTier ?? null,
      rulesTrace: c.assessments[0]?.rulesTrace ?? [],
    }))
    .filter((r: { tier: number | null }) =>
      typeof tier === "number" ? r.tier === tier : true,
    );

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
      <AdminTable rows={rows} />
    </div>
  );
}
