/** Verify email notice + CTA — TopBar when Get Started workspace email is unverified. */

export default function VerifyEmailNotice({
  onVerify,
}: {
  onVerify: () => void;
}) {
  return (
    <div
      role="status"
      className="flex max-w-full items-center gap-1.5 rounded-md border border-warning-fg/35 bg-warning-bg px-2.5 py-1 text-xs font-medium text-warning-fg"
    >
      <span className="truncate">Verify your email</span>
      <span className="shrink-0 text-warning-fg/50" aria-hidden>
        |
      </span>
      <button
        type="button"
        onClick={onVerify}
        className="shrink-0 underline underline-offset-2 outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-warning-fg/40"
      >
        Verify
      </button>
    </div>
  );
}
