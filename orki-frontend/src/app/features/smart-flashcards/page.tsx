import type { Metadata } from "next";

import { SmartFlashcards } from "@/widgets/landing/SmartFlashcards";

export const metadata: Metadata = {
  title: "Smart Flashcards",
  description:
    "Spaced repetition flashcards that adapt to how you learn — surfacing the right cards at exactly the right moment.",
};

export default function SmartFlashcardsPage() {
  return <SmartFlashcards />;
}
