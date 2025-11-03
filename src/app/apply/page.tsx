// Σχόλιο (GR): Server component που τραβάει τις ερωτήσεις και εμφανίζει wizard
import { prisma } from "@/lib/prisma";
import ApplyForm from "./ui/apply-form";

export default async function ApplyPage() {
  const questions = await prisma.question.findMany({
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Αίτηση Υποψηφίου</h1>
      <p className="text-sm text-muted-foreground">
        Συμπλήρωσε τα στοιχεία σου και απάντησε στις ερωτήσεις δεξιοτήτων.
      </p>
      <ApplyForm questions={questions} />
    </div>
  );
}
