import {
  ICON_LIBRARIES,
  type IconLibraryId,
} from "@/config/iconLibraries";
import { useIconLibraryStore } from "@/store/iconLibrary";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

/** Icon library + style variant picker for the design controller Appearance tab. */
export default function IconLibraryPicker() {
  const libraryId = useIconLibraryStore((s) => s.libraryId);
  const variant = useIconLibraryStore((s) => s.variant);
  const setLibrary = useIconLibraryStore((s) => s.setLibrary);
  const setVariant = useIconLibraryStore((s) => s.setVariant);

  const activeLibrary = ICON_LIBRARIES.find((l) => l.id === libraryId);

  return (
    <div className="space-y-4 px-4 py-4">
      <div className="space-y-0.5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Icon library
        </p>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Swap every app icon (except the mascot logo). Styles below apply to
          the selected library only — Thin/Duotone for Phosphor, Sharp for
          Material, and so on.
        </p>
      </div>

      <RadioGroup
        value={libraryId}
        onValueChange={(v) => setLibrary(v as IconLibraryId)}
        className="grid gap-1.5"
      >
        {ICON_LIBRARIES.map((lib) => (
          <div key={lib.id} className="flex items-center gap-2">
            <RadioGroupItem value={lib.id} id={`icon-lib-${lib.id}`} />
            <Label
              htmlFor={`icon-lib-${lib.id}`}
              className={cn(
                "cursor-pointer text-sm font-normal",
                libraryId === lib.id && "font-medium text-foreground"
              )}
            >
              {lib.label}
            </Label>
          </div>
        ))}
      </RadioGroup>

      {activeLibrary && activeLibrary.variants.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Style — {activeLibrary.label}
          </p>
          {activeLibrary.styleNote ? (
            <p className="text-xs leading-relaxed text-muted-foreground">
              {activeLibrary.styleNote}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-1.5">
            {activeLibrary.variants.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setVariant(v.id)}
                className={cn(
                  "rounded-md border px-2.5 py-1 text-xs transition-colors",
                  variant === v.id
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-background text-muted-foreground hover:text-foreground"
                )}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
