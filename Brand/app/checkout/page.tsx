import { Suspense } from "react";
import { CheckoutPage } from "@/components/CheckoutPage";

export default function CheckoutRoute() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-obsidian" />}>
      <CheckoutPage />
    </Suspense>
  );
}
