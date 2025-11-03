"use server";
// Σχόλιο (GR): Server Action που σώζει υποψήφιο, απαντήσεις και υπολογίζει tier
import { prisma } from "@/lib/prisma";
import { computeTier } from "@/lib/tiering";
import { revalidatePath } from "next/cache";
import { notifyNewApplication } from "@/lib/mail";

type Payload = {
  name: string;
  email: string;
  phone?: string;
  answers: { questionId: string; value: string }[];
};

export async function submitApplication(payload: Payload) {
  // Σχόλιο (GR): Βασικός έλεγχος δεδομένων (θα μπορούσαμε με Zod server-side)
  if (!payload.name || !payload.email) {
    throw new Error("Απαιτούνται Ονοματεπώνυμο και Email");
  }

  // Σχόλιο (GR): Δημιουργία υποψήφιου ή ενημέρωση αν υπάρχει ίδιο email
  const candidate = await prisma.candidate.upsert({
    where: { email: payload.email },
    update: { name: payload.name, phone: payload.phone ?? null },
    create: {
      name: payload.name,
      email: payload.email,
      phone: payload.phone ?? null,
    },
  });

  // Σχόλιο (GR): Αποθήκευση απαντήσεων (upsert για να μην διπλογράφουμε)
  for (const a of payload.answers) {
    await prisma.answer.upsert({
      where: {
        candidateId_questionId: {
          candidateId: candidate.id,
          questionId: a.questionId,
        },
      },
      update: { value: a.value },
      create: {
        candidateId: candidate.id,
        questionId: a.questionId,
        value: a.value,
      },
    });
  }

  // Σχόλιο (GR): Υπολογισμός Tier + rulesTrace για διαφάνεια αξιολόγησης
  const all = await prisma.answer.findMany({
    where: { candidateId: candidate.id },
    include: { question: true },
  });

  const { tier, trace } = computeTier(all);

  await prisma.assessment.create({
    data: {
      candidateId: candidate.id,
      computedTier: tier,
      rulesTrace: trace,
    },
  });

  // Σχόλιο (GR): Revalidate σελίδων που δείχνουν λίστες (π.χ. admin)
  revalidatePath("/admin");

  // Σχόλιο (GR): Ειδοποιήσεις email για υποψήφιο και admin
  try {
    await notifyNewApplication({
      candidate: { name: candidate.name, email: candidate.email },
      tier,
      trace,
    });
  } catch (error) {
    console.error("[mail] Αποτυχία αποστολής ειδοποίησης:", error);
  }

  return { candidateId: candidate.id, tier };
}
