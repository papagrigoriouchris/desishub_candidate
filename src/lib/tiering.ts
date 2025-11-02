// Σχόλιο (GR): Καθαροί κανόνες (χωρίς I/O) ώστε να τεστάρονται εύκολα
import type { Answer, Question } from "@prisma/client";

type AnswerWithQ = Answer & { question: Question };

export function computeTier(answers: AnswerWithQ[]) {
  // Σχόλιο (GR): Φτιάχνουμε Map για γρήγορη πρόσβαση σε απαντήσεις ανά key
  const byKey = new Map<string, string>();
  for (const a of answers) byKey.set(a.question.key, a.value);

  // Helpers
  const yes = (k: string) => (byKey.get(k) ?? "").toLowerCase().startsWith("y");
  const trace: string[] = [];

  // Κανόνας Tier 5
  if (
    yes("knows_html_css_js") &&
    yes("has_crud_next") &&
    yes("has_auth") &&
    yes("has_express_hono") &&
    yes("has_go_api")
  ) {
    trace.push(
      "✅ Καλύπτει όλα: βασικά, CRUD, auth, Express/Hono, Go API → Tier 5",
    );
    return { tier: 5, trace };
  }

  // Tier 4
  if (
    yes("knows_html_css_js") &&
    yes("has_crud_next") &&
    yes("has_auth") &&
    yes("has_express_hono")
  ) {
    trace.push("✅ Έως Express/Hono, χωρίς Go → Tier 4");
    return { tier: 4, trace };
  }

  // Tier 3
  if (yes("knows_html_css_js") && yes("has_crud_next") && yes("has_auth")) {
    trace.push("✅ CRUD + Auth, χωρίς Express/Hono → Tier 3");
    return { tier: 3, trace };
  }

  // Tier 2
  if (yes("knows_html_css_js") && yes("has_crud_next")) {
    trace.push("✅ CRUD, χωρίς Auth → Tier 2");
    return { tier: 2, trace };
  }

  // Tier 1
  if (yes("knows_html_css_js")) {
    trace.push("✅ Βασικά HTML/CSS/JS → Tier 1");
    return { tier: 1, trace };
  }

  // Tier 0
  trace.push("ℹ️ Μη επαρκείς βάσεις → Tier 0");
  return { tier: 0, trace };
}
