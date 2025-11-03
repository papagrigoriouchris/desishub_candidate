"use client";
// Σχόλιο (GR): Κουμπί αποσύνδεσης για το admin dashboard
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function LogoutButton() {
  return (
    <Button
      variant="outline"
      onClick={() =>
        signOut({
          callbackUrl: "/signin",
        })
      }
    >
      Αποσύνδεση
    </Button>
  );
}
