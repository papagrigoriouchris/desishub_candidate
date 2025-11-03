"use client";
// Σχόλιο (GR): Client component με React Hook Form & Zod για credentials login
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const schema = z.object({
  email: z.string().email("Μη έγκυρο email"),
  password: z.string().min(6, "Τουλάχιστον 6 χαρακτήρες"),
});

type FormData = z.infer<typeof schema>;

export function SignInForm() {
  // Σχόλιο (GR): Τοπική κατάσταση για μηνύματα λάθους/φόρτωσης
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  // Σχόλιο (GR): Είσοδος με credentials μέσω NextAuth
  const onSubmit = async (data: FormData) => {
    setError(null);
    const res = await signIn("credentials", {
      ...data,
      redirect: false,
    });
    // Σχόλιο (GR): Ελέγχουμε το αποτέλεσμα για να εμφανίσουμε inline μηνύματα ή να κάνουμε redirect μόνοι μας
    if (res?.error) {
      const message = "Αποτυχία σύνδεσης. Ελέγξτε στοιχεία.";
      setError(message);
      toast.error(message);
      return;
    }
    router.push("/admin");
  };

  // Σχόλιο (GR): Είσοδος με Google OAuth
  const handleGoogle = () => signIn("google", { callbackUrl: "/admin" });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Είσοδος Διαχειριστή</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register("email")} />
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Κωδικός</Label>
          <Input id="password" type="password" {...register("password")} />
          {errors.password && (
            <p className="text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button className="w-full" disabled={isSubmitting} type="submit">
          Σύνδεση
        </Button>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGoogle}
        >
          Σύνδεση με Google
        </Button>
        <Link href="/" className="block text-center text-sm underline">
          Αρχική οθόνη
        </Link>
      </form>
    </div>
  );
}
