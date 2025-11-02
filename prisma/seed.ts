// Σχόλιο (GR): Δημιουργούμε demo ερωτήσεις και ένα admin user
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

async function main() {
  const pwd = await bcrypt.hash("admin1234", 10);
  await prisma.user.upsert({
    where: { email: "admin@local.test" },
    update: {},
    create: {
      email: "admin@local.test",
      name: "Admin",
      passwordHash: pwd,
      role: "admin",
    },
  });

  const questions = [
    {
      key: "knows_html_css_js",
      text: "Γνωρίζεις βασικά HTML/CSS/JS;",
      weight: 1,
    },
    {
      key: "has_crud_next",
      text: "Έχεις υλοποιήσει CRUD με Next.js;",
      weight: 2,
    },
    { key: "has_auth", text: "Έχεις υλοποιήσει authentication;", weight: 2 },
    {
      key: "has_express_hono",
      text: "Έχεις υλοποιήσει Express/Hono API;",
      weight: 2,
    },
    { key: "has_go_api", text: "Έχεις υλοποιήσει Go API;", weight: 2 },
  ];

  for (const q of questions) {
    await prisma.question.upsert({
      where: { key: q.key },
      update: {},
      create: q,
    });
  }
}

main()
  .then(() => {
    console.log("✅ Seed ολοκληρώθηκε");
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
