"use client";

type SkipTourButtonProps = {
  onClick: () => void;
};

export function SkipTourButton({ onClick }: SkipTourButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Skip tour"
      className="fixed bottom-6 right-6 z-[120] inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/[0.2] bg-black/[0.75] text-white shadow-[0_10px_40px_rgba(0,0,0,0.45)] transition hover:-translate-y-0.5 hover:bg-ember/75"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-5 w-5 stroke-current"
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 7l6 5-6 5" />
        <path d="M12 7l6 5-6 5" />
      </svg>
    </button>
  );
}
