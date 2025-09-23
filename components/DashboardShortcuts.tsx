import React from "react";
import { FileText, ListChecks } from "lucide-react";
import Link from "next/link";

export default function DashboardShortcuts() {
  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <Link href="./pages/quiz" className="flex items-center gap-3 px-6 py-4 rounded-xl bg-blue-600 text-white text-lg font-semibold hover:bg-blue-500 transition-all">
        <FileText className="h-6 w-6" />
        AI Quiz Generator
      </Link>
      <Link href="./pages/flashcards" className="flex items-center gap-3 px-6 py-4 rounded-xl bg-green-600 text-white text-lg font-semibold hover:bg-green-500 transition-all">
        <ListChecks className="h-6 w-6" />
        Flashcards Generator
      </Link>
    </div>
  );
}
