import Link from "next/link";

export default function Home() {
  // Σχόλιο (GR): Απλή αρχική σελίδα με links για τις βασικές ροές
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-semibold">
          Desishub — Candidate Platform
        </h1>
        <div className="flex gap-3 justify-center">
          <Link href="/apply" className="underline">
            Υποβολή Αίτησης
          </Link>
          <Link href="/signin" className="underline">
            Είσοδος Admin
          </Link>
        </div>
      </div>
    </main>
  );
}
