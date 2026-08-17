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
          className="rounded-full border border-border/70 bg-chat-bubble px-3 py-1.5 text-[13px] text-foreground/90 transition-all hover:border-primary/50 hover:bg-primary/5 hover:text-primary disabled:opacity-50"
        >
          {q}
        </button>
      ))}
    </div>
  );
}