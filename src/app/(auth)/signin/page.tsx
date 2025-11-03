// Σχόλιο (GR): Σελίδα εισόδου με Credentials + Google, με shadcn components
import { Metadata } from "next";
import { SignInForm } from "./signin-form";

export const metadata: Metadata = { title: "Είσοδος" };

export default function SignInPage() {
  // Σχόλιο (GR): Απλό wrapper ώστε να κρατάμε καθαρό τον κώδικα
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <SignInForm />
      </div>
    </div>
  );
}
