"use server";
// Σχόλιο (GR): Αποστολή email ειδοποιήσεων μέσω Resend με βασικό logging
import { Resend } from "resend";
import type { Candidate } from "@prisma/client";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM = process.env.RESEND_FROM;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

async function sendEmail({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text: string;
  html: string;
}) {
  if (!resend || !RESEND_FROM) {
    console.warn(
      "[mail] Αδυναμία αποστολής: λείπει RESEND_API_KEY ή RESEND_FROM",
    );
    return { skipped: true };
  }
  try {
    const result = await resend.emails.send({
      from: RESEND_FROM,
      to,
      subject,
      text,
      html,
    });
    console.log("[mail] Απεστάλη:", { to, id: result.id });
    return { ok: true, id: result.id };
  } catch (error) {
    console.error("[mail] Σφάλμα αποστολής:", error);
    return { ok: false, error };
  }
}

export async function notifyNewApplication({
  candidate,
  tier,
  trace,
}: {
  candidate: Pick<Candidate, "name" | "email">;
  tier: number;
  trace: string[];
}) {
  const appBaseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const traceText = trace.join("\n");
  const traceHtml = trace.map((line) => `<li>${line}</li>`).join("");

  await Promise.all([
    sendEmail({
      to: candidate.email,
      subject: `Η αίτησή σου καταχωρήθηκε (Tier ${tier})`,
      text: [
        `Γεια σου ${candidate.name},`,
        "",
        "Λάβαμε την αίτησή σου στο Desishub Candidate Platform.",
        `Το σύστημά μας σε κατέταξε προσωρινά στο Tier ${tier}.`,
        "",
        "Θα ενημερωθείς σύντομα για τα επόμενα βήματα.",
        "",
        "Με εκτίμηση,",
        "Η ομάδα του Desishub",
      ].join("\n"),
      html: `
        <p>Γεια σου ${candidate.name},</p>
        <p>Λάβαμε την αίτησή σου στο Desishub Candidate Platform και καταχωρήθηκε με tier <strong>${tier}</strong>.</p>
        <p>Θα ενημερωθείς σύντομα για τα επόμενα βήματα.</p>
        <p>Με εκτίμηση,<br/>Η ομάδα του Desishub</p>
      `,
    }),
    ADMIN_EMAIL
      ? sendEmail({
          to: ADMIN_EMAIL,
          subject: "Νέα αίτηση υποψηφίου",
          text: [
            "Νέα αίτηση υποψηφίου:",
            `Όνομα: ${candidate.name}`,
            `Email: ${candidate.email}`,
            `Tier: ${tier}`,
            "",
            "Λεπτομέρειες αξιολόγησης:",
            traceText,
            "",
            `Δες το dashboard: ${appBaseUrl}/admin`,
          ].join("\n"),
          html: `
            <p><strong>Νέα αίτηση υποψηφίου</strong></p>
            <ul>
              <li>Όνομα: ${candidate.name}</li>
              <li>Email: ${candidate.email}</li>
              <li>Tier: ${tier}</li>
            </ul>
            <p>Λεπτομέρειες αξιολόγησης:</p>
            <ul>${traceHtml}</ul>
            <p><a href="${appBaseUrl}/admin">Μετάβαση στο admin dashboard</a></p>
          `,
        })
      : Promise.resolve({ skipped: true }),
  ]);
}
