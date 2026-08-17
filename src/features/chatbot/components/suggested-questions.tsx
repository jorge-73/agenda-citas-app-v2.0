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
          className="rounded-full border border-chat-border/70 bg-chat-bubble px-3 py-1.5 text-[13px] text-chat-foreground/90 transition-all hover:border-chat-accent/50 hover:bg-chat-accent/5 hover:text-chat-accent disabled:opacity-50"
        >
          {q}
        </button>
      ))}
    </div>
  );
}