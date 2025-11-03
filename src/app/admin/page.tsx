// Σχόλιο (GR): Server component που φέρνει συγκεντρωτικά υποψήφιους & τελευταίο assessment
import { prisma } from "@/lib/prisma";
import AdminTable from "./ui/admin-table";
import TierDistributionCard from "./ui/tier-distribution-card";
import LogoutButton from "./ui/logout-button";

export const dynamic = "force-dynamic"; // Σχόλιο (GR): Για απλή φρεσκάδα δεδομένων στο dashboard

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { q?: string; tier?: string };
}) {
  const q = searchParams.q?.trim() || "";
  const tierParam = searchParams.tier?.trim();
  const tier =
    tierParam && Number.isFinite(Number(tierParam))
      ? Number(tierParam)
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

  const distribution = Array.from({ length: 6 }, (_, idx) => ({
    tier: idx,
    count: rows.filter((r) => r.tier === idx).length,
  }));
  const totalAssessed = distribution.reduce((sum, item) => sum + item.count, 0);
  const pendingCount = rows.filter((r) => r.tier === null).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Διαχείριση υποψηφίων και αξιολογήσεων.
          </p>
        </div>
        <LogoutButton />
      </div>
      <TierDistributionCard
        data={distribution}
        total={totalAssessed}
        pending={pendingCount}
      />
      <AdminTable rows={rows} />
    </div>
  );
}
