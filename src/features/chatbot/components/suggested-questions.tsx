"use client";

interface SuggestedQuestionsProps {
  questions: string[];
  onSelect: (question: string) => void;
  disabled?: boolean;
}

export function SuggestedQuestions({
  questions,
  onSelect,
  disabled,
}: SuggestedQuestionsProps) {
  if (questions.length === 0) return null;

  return (
    <div className="flex w-full flex-wrap justify-center gap-2">
      {questions.map((q) => (
        <button
          key={q}
          type="button"
          onClick={() => onSelect(q)}
          disabled={disabled}
          className="rounded-full border bg-background px-3 py-1.5 text-xs text-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
        >
          {q}
        </button>
      ))}
    </div>
  );
}