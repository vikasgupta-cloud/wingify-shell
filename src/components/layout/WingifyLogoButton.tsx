import { useNavigate } from "react-router-dom";
import logoUrl from "../../assets/wingify-logo.png";
import { cn } from "../../lib/utils";

/**
 * Home button carrying the Wingify mark. 32px so the mark lands on the same
 * centre line everywhere: x=32 from a 16px header inset or centred in the rail's
 * 40px icon slot, y=28 inside any h-14 band. Switching views must not move it.
 */
export default function WingifyLogoButton({
  className,
}: {
  className?: string;
}) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      aria-label="Go to Home dashboard"
      onClick={() => navigate("/home/dashboard")}
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-muted",
        className
      )}
    >
      <img src={logoUrl} alt="Wingify" className="h-5 w-auto object-contain" />
    </button>
  );
}
