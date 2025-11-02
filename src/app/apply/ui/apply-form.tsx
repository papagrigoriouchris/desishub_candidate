"use client";
// Σχόλιο (GR): Client φόρμα με RHF + Zod, καλεί server action submitApplication
import { useState, useTransition } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { submitApplication } from "../actions";

const schema = z.object({
  name: z.string().min(2, "Πολύ σύντομο"),
  email: z.string().email("Μη έγκυρο email"),
  phone: z.string().optional(),
  answers: z.array(
    z.object({
      questionId: z.string(),
      value: z.string(),
    }),
  ),
});

type FormData = z.infer<typeof schema>;

export default function ApplyForm({
  questions,
}: {
  questions: { id: string; text: string; key: string }[];
}) {
  // Σχόλιο (GR): Default απαντήσεις "no" ώστε να μη μένουν κενά
  const defaultAnswers = questions.map((q) => ({
    questionId: q.id,
    value: "no",
  }));

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", phone: "", answers: defaultAnswers },
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting, errors },
  } = form;
  const [result, setResult] = useState<{ tier: number } | null>(null);
  const [isPending, startTransition] = useTransition();

  // Σχόλιο (GR): Υποβολή που καλεί server action και δείχνει αποτέλεσμα
  const onSubmit = (data: FormData) => {
    startTransition(async () => {
      const res = await submitApplication(data);
      setResult({ tier: res.tier });
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardContent className="space-y-4 p-6">
          <div>
            <Label htmlFor="name">Ονοματεπώνυμο</Label>
            <Input id="name" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="phone">Τηλέφωνο (προαιρετικό)</Label>
            <Input id="phone" {...register("phone")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-6">
          <h2 className="font-medium">Ερωτήσεις δεξιοτήτων</h2>
          <div className="space-y-3">
            {questions.map((q, idx) => (
              <div
                key={q.id}
                className="flex items-center justify-between gap-4"
              >
                <Label className="flex-1">{q.text}</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={
                      (watch(`answers.${idx}.value`) ?? "no") === "yes"
                        ? "default"
                        : "outline"
                    }
                    onClick={() => setValue(`answers.${idx}.value`, "yes")}
                  >
                    Ναι
                  </Button>
                  <Button
                    type="button"
                    variant={
                      (watch(`answers.${idx}.value`) ?? "no") === "no"
                        ? "default"
                        : "outline"
                    }
                    onClick={() => setValue(`answers.${idx}.value`, "no")}
                  >
                    Όχι
                  </Button>
                  {/* Σχόλιο (GR): Κρυφό input ώστε να γράφεται στο form state */}
                  <input
                    type="hidden"
                    {...register(`answers.${idx}.questionId`)}
                    value={q.id}
                  />
                  <input type="hidden" {...register(`answers.${idx}.value`)} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={isSubmitting || isPending}>
          Υποβολή
        </Button>
        {result && (
          <span className="text-sm">
            ✅ Το σύστημά μας σε κατέταξε στο{" "}
            <strong>Tier {result.tier}</strong>.
          </span>
        )}
      </div>
    </form>
  );
}
