/** Trial expired notice + Upgrade CTA — full-width RootChrome status strip. */
export default function TrialOverNotice({
  onUpgrade,
}: {
  onUpgrade: () => void;
}) {
  return (
    <div
      role="status"
      className="flex w-full shrink-0 items-center justify-center gap-1.5 border-b border-danger-fg/25 bg-danger-bg px-4 py-1.5 text-xs font-medium text-danger-fg"
    >
      <span className="truncate">Your trial is over</span>
      <span className="shrink-0 text-danger-fg/50" aria-hidden>
        |
      </span>
      <button
        type="button"
        onClick={onUpgrade}
        className="shrink-0 underline underline-offset-2 outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-danger-fg/40"
      >
        Upgrade
      </button>
    </div>
  );
}
