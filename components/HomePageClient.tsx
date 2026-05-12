"use client";

import { useEffect, useState } from "react";
import { HomePage } from "@/components/HomePage";

export function HomePageClient() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-obsidian" />;
  }

  return <HomePage />;
}
