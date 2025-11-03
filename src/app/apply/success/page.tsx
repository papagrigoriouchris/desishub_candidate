// Σχόλιο (GR): Σελίδα επιβεβαίωσης μετά την υποβολή αίτησης
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Επιτυχής Υποβολή",
};

export default function ApplySuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md space-y-6 text-center">
        <h1 className="text-2xl font-semibold">Ευχαριστούμε για την αίτηση!</h1>
        <p className="text-muted-foreground">
          Η ομάδα μας θα εξετάσει την υποβολή σου και θα σε ενημερώσει για τα
          επόμενα βήματα σύντομα. Κράτησε το email σου υπό έλεγχο!
        </p>
        <div className="space-x-3">
          <Link href="/" className="underline">
            Επιστροφή στην αρχική
          </Link>
          <Link href="/apply" className="underline">
            Νέα αίτηση
          </Link>
        </div>
      </div>
    </div>
  );
}
