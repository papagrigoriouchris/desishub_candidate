## Desishub Candidate Platform

A full-stack Next.js 16 (App Router) application that streamlines candidate intake, automated tiering, and admin review workflows.

---

## Features

- **Candidate Application Flow**
  - Client-side form powered by React Hook Form and Zod validation.
  - Skill questions rendered dynamically from the database with quick “Yes/No” toggles.
  - Server Action persists candidates, stores answers, computes tier scores, and triggers Resend email notifications.
  - Toast feedback on submission and redirect to a confirmation screen.

- **Automated Tiering**
  - Deterministic rules engine (`src/lib/tiering.ts`) classifies candidates from Tier 0–5.
  - Trace information stored with each assessment for transparency in the admin UI.

- **Admin Dashboard**
  - Protected via NextAuth middleware and role-based access control.
  - Server component fetches candidates with their latest assessment.
  - Filters by name/email and tier, CSV export, and a rules trace viewer.
  - Analytics card with tier distribution chart (Recharts) and pending count.
  - Logout button that signs admins out and redirects to the custom sign-in page.

- **Authentication**
  - NextAuth with Prisma adapter, JWT sessions, Google OAuth, and credentials login.
  - Role propagation to JWT/session; custom sign-in form with inline errors, toast notifications, and “Back to Home” link.

- **Tooling & Infrastructure**
  - Prisma ORM for PostgreSQL with seed script and typed models.
  - Resend integration for candidate/admin email notifications (with logging).
  - Toast notifications via `sonner`, shadcn/ui component library, Tailwind CSS v4.
  - TypeScript strict mode, ESLint 9, Prettier 3, Husky + lint-staged hooks.

---

## Project Structure

```
src/
  app/
    apply/            # Candidate application flow (page, form, server actions, success page)
    admin/            # Admin dashboard, analytics, logout controls
    (auth)/signin/    # Custom admin sign-in page + form
    api/auth/         # NextAuth route handlers and configuration
    layout.tsx        # Root layout with global Providers (toasts)
  lib/
    prisma.ts         # Prisma client singleton
    tiering.ts        # Tier computation rules engine
    auth.ts           # Helper to require admin sessions
    mail.ts           # Resend email helper with logging
prisma/
  schema.prisma       # Data model (users, candidates, questions, answers, assessments)
  seed.ts             # Seeds admin account + default questions
```

---

## Requirements

- Node.js ≥ 18
- pnpm (recommended) or npm/yarn
- PostgreSQL database (Neon, Supabase, RDS, etc.)
- Resend account (domain or sender/email verification)
- Google OAuth app (optional, for Google sign-in)

---

## Environment Variables

Create a `.env` file with the following keys:

```env
DATABASE_URL="postgresql://user:password@host:port/db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-random-secret"

# Google OAuth (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Resend (required for email notifications)
RESEND_API_KEY="re_xxx"
RESEND_FROM="Desishub <onboarding@resend.dev>"
ADMIN_EMAIL="admin@example.com"
```

> **Notes**
>
> - For Resend free tier, either use the onboarding sender or verify your domain/email and recipient addresses.
> - `ADMIN_EMAIL` controls who receives admin notifications when new applications arrive.

---

## Installation & Commands

```bash
# Install dependencies (regenerates node_modules & lockfile)
pnpm install --no-frozen-lockfile

# Start development server
pnpm dev

# Lint the project
pnpm lint

# Build for production
pnpm build

# Run production server
pnpm start

# Prisma helpers
pnpm db:generate   # prisma generate
pnpm db:migrate    # prisma migrate dev
pnpm db:seed       # seeds default admin + questions
```

---

## Database & Seeding

1. Update `DATABASE_URL` in `.env`.
2. Run migrations: `pnpm db:migrate`.
3. Seed default data:

   ```bash
   pnpm db:seed
   ```

   This creates:
   - Admin account (`admin@local.test` – password defined in `prisma/seed.ts`).
   - Default skill questions used by the application form.

---

## Running the App

1. Install dependencies and ensure environment variables are set.
2. Start the app: `pnpm dev` → open `http://localhost:3000`.
3. Candidate flow:
   - Visit `/apply`, submit the form, receive toast feedback, and land on the success page.
   - Check terminal logs for `[mail]` messages confirming Resend activity.
4. Admin flow:
   - Sign in at `/signin` using seeded credentials or Google OAuth.

- Access `/admin` to review candidates, filter by tier/text, export CSV, and inspect analytics.

---

## Resend Troubleshooting

- **No emails received?**
  - Verify `RESEND_API_KEY`/`RESEND_FROM` are set and restart the server after changes.
  - Use a verified sender or domain and add recipient emails under Resend’s “Verified emails”.
  - Check server logs for `[mail]` messages to confirm send status or errors.
  - Resend’s free sandbox only delivers to verified recipients.

---

## Testing & Quality

- `pnpm lint` ensures adherence to the project’s ESLint configuration.
- Husky + lint-staged are prepared for pre-commit formatting checks (run `pnpm prepare` after install to enable hooks).

---

## Deployment Notes

- Configure environment variables in your hosting provider (Vercel, Render, etc.).
- Run Prisma migrations (`prisma migrate deploy`) during deploys.
- Provide production Resend credentials and verified domain.
- Configure NextAuth providers (Google) with production callback URLs.

---

## Extending the Platform

- Adjust tiering rules in `src/lib/tiering.ts`.
- Add more question types or scoring logic by updating the Prisma schema.
- Customize UI components in `src/components/ui`.
- Integrate additional notification channels (queues, Slack, etc.) by modifying `notifyNewApplication`.

Happy hacking!
