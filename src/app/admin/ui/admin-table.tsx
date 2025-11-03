"use client";
// Σχόλιο (GR): Client table με γρήγορα φίλτρα και export CSV
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { stringify } from "csv-stringify/sync";

type Row = {
  id: string;
  name: string;
  email: string;
  createdAt: string | Date;
  tier: number | null;
  rulesTrace: string[] | Record<string, unknown> | null;
};

export default function AdminTable({ rows }: { rows: Row[] }) {
  const [q, setQ] = useState("");
  const [tier, setTier] = useState<number | "">("");

  // Σχόλιο (GR): Client-side φίλτρα για άμεση ανταπόκριση
  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const byText = q
        ? r.name?.toLowerCase().includes(q.toLowerCase()) ||
          r.email.toLowerCase().includes(q.toLowerCase())
        : true;
      const byTier = tier === "" ? true : r.tier === tier;
      return byText && byTier;
    });
  }, [rows, q, tier]);

  // Σχόλιο (GR): Γρήγορο export CSV (μόνο βασικές στήλες)
  const handleExport = () => {
    const data = filtered.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      tier: r.tier ?? "",
      createdAt: new Date(r.createdAt).toISOString(),
    }));
    const csv = stringify(data, { header: true });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "candidates.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <label className="block text-sm mb-1">Αναζήτηση</label>
          <Input
            placeholder="Όνομα ή email..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Tier</label>
          <select
            className="border rounded-md h-10 px-3"
            value={tier}
            onChange={(e) =>
              setTier(e.target.value === "" ? "" : Number(e.target.value))
            }
          >
            <option value="">Όλα</option>
            {[0, 1, 2, 3, 4, 5].map((t) => (
              <option key={t} value={t}>
                Tier {t}
              </option>
            ))}
          </select>
        </div>
        <Button onClick={handleExport}>Export CSV</Button>
      </div>

      <div className="rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/30">
            <tr>
              <th className="text-left p-3">Όνομα</th>
              <th className="text-left p-3">Email</th>
              <th className="text-left p-3">Tier</th>
              <th className="text-left p-3">Ημ/νία</th>
              <th className="text-left p-3">Λεπτομέρειες</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-3">{r.name}</td>
                <td className="p-3">{r.email}</td>
                <td className="p-3">
                  {r.tier === null ? (
                    <Badge variant="outline">N/A</Badge>
                  ) : (
                    <Badge>Tier {r.tier}</Badge>
                  )}
                </td>
                <td className="p-3">
                  {new Date(r.createdAt).toLocaleString()}
                </td>
                <td className="p-3">
                  <details>
                    <summary className="cursor-pointer">rulesTrace</summary>
                    <div className="mt-2 text-xs whitespace-pre-wrap">
                      {Array.isArray(r.rulesTrace)
                        ? r.rulesTrace.join("\n")
                        : JSON.stringify(r.rulesTrace, null, 2)}
                    </div>
                  </details>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="p-6 text-center text-muted-foreground"
                >
                  Καμία εγγραφή
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
