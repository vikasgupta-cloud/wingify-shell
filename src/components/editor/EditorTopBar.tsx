import { useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  Eye,
  Monitor,
  MoreHorizontal,
  RectangleHorizontal,
  Save,
  Smartphone,
  Tablet,
  UnfoldHorizontal,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { CampaignStatus } from "@/data/campaigns";
import type {
  EditorDevice,
  EditorPreviewWidthMode,
} from "@/config/editorScenarios";
import {
  isViewingOlderVersion,
  useEditorSavesStore,
} from "@/store/editorSaves";

const DEVICES: { id: EditorDevice; icon: typeof Monitor; label: string }[] = [
  { id: "desktop", icon: Monitor, label: "Desktop" },
  { id: "tablet", icon: Tablet, label: "Tablet" },
  { id: "mobile", icon: Smartphone, label: "Mobile" },
];

const WIDTH_MODES: {
  id: EditorPreviewWidthMode;
  icon: typeof UnfoldHorizontal;
  label: string;
}[] = [
  { id: "fit", icon: UnfoldHorizontal, label: "Fit width" },
  { id: "fixed", icon: RectangleHorizontal, label: "Fixed width" },
];

/**
 * Editor chrome top bar — campaign context, preview chrome, and save.
 */
export function EditorTopBar({
  campaignName = "Campaign",
  status,
  backHref = "/web-experiment",
  showPreviewChrome = true,
  device = "desktop",
  onDeviceChange,
  previewWidthMode = "fit",
  onPreviewWidthModeChange,
}: {
  campaignName?: string;
  status?: CampaignStatus;
  backHref?: string;
  /** Language / device / width controls (hidden in code mode). */
  showPreviewChrome?: boolean;
  device?: EditorDevice;
  onDeviceChange?: (device: EditorDevice) => void;
  previewWidthMode?: EditorPreviewWidthMode;
  onPreviewWidthModeChange?: (mode: EditorPreviewWidthMode) => void;
}) {
  const versions = useEditorSavesStore((s) => s.versions);
  const activeVersionId = useEditorSavesStore((s) => s.activeVersionId);
  const save = useEditorSavesStore((s) => s.save);
  const viewingOlder = isViewingOlderVersion(versions, activeVersionId);
  const navigate = useNavigate();

  const [composeOpen, setComposeOpen] = useState(false);
  const [message, setMessage] = useState("");

  const saveWithoutMessage = () => {
    save();
    setMessage("");
    setComposeOpen(false);
  };

  const saveWithMessage = () => {
    save(message);
    setMessage("");
    setComposeOpen(false);
  };

  const saveAndExit = () => {
    save();
    setMessage("");
    setComposeOpen(false);
    navigate(backHref);
  };

  return (
    <header className="relative flex h-11 shrink-0 items-center justify-between border-b border-border bg-background px-2">
      <div className="flex h-7 items-center gap-1.5 pl-0.5">
        <Button
          variant="ghost"
          size="icon"
          className="size-7 shrink-0 rounded-md"
          aria-label="Back to campaign"
          asChild
        >
          <Link to={backHref}>
            <ArrowLeft className="size-4" strokeWidth={1.75} />
          </Link>
        </Button>
        <p className="max-w-[220px] truncate text-[13px] font-medium leading-none text-foreground">
          {campaignName}
        </p>
        {status ? (
          <span className="inline-flex h-5 shrink-0 items-center rounded-full border border-border bg-muted px-2.5 text-xs font-medium leading-none text-foreground">
            {status}
          </span>
        ) : (
          <span className="inline-flex h-5 shrink-0 items-center rounded-full border border-border bg-muted px-2.5 text-xs font-medium leading-none text-muted-foreground">
            —
          </span>
        )}
      </div>

      <div className="flex h-7 items-center gap-2">
        {showPreviewChrome && (
          <>
            <button
              type="button"
              className="inline-flex h-6 items-center gap-1 rounded-md px-2 text-xs font-semibold text-foreground outline-none hover:bg-muted"
              aria-label="Language"
            >
              EN
              <ChevronDown
                className="size-3.5 text-muted-foreground"
                strokeWidth={1.75}
              />
            </button>

            <div className="flex h-7 items-center gap-1 rounded-md border border-border bg-muted p-px">
              {DEVICES.map((d) => {
                const selected = device === d.id;
                const DeviceIcon = d.icon;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => onDeviceChange?.(d.id)}
                    aria-label={d.label}
                    className={cn(
                      "inline-flex h-[26px] items-center justify-center rounded-[5px] px-2 text-foreground outline-none transition-colors",
                      selected
                        ? "bg-background shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <DeviceIcon className="size-4" strokeWidth={1.75} />
                  </button>
                );
              })}
            </div>

            <div className="flex h-7 items-center gap-1 rounded-md border border-border bg-muted p-px">
              {WIDTH_MODES.map((m) => {
                const selected = previewWidthMode === m.id;
                const WidthIcon = m.icon;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => onPreviewWidthModeChange?.(m.id)}
                    aria-label={m.label}
                    title={m.label}
                    className={cn(
                      "inline-flex h-[26px] items-center justify-center rounded-[5px] px-2 text-foreground outline-none transition-colors",
                      selected
                        ? "bg-background shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <WidthIcon className="size-4" strokeWidth={1.75} />
                  </button>
                );
              })}
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-6 rounded-md"
              aria-label="More options"
            >
              <MoreHorizontal className="size-4" strokeWidth={1.75} />
            </Button>

            <span className="mx-0.5 h-5 w-px shrink-0 bg-border" aria-hidden />
          </>
        )}

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 gap-1.5 rounded-md px-2.5 text-[13px] font-semibold"
        >
          <Eye className="size-3.5" strokeWidth={1.75} />
          Preview
        </Button>

        <div className="relative">
          <div className="inline-flex h-7 items-stretch">
            <Button
              type="button"
              size="sm"
              onClick={saveWithoutMessage}
              disabled={viewingOlder}
              className="h-7 gap-1.5 rounded-r-none border-r border-primary-foreground/20 px-2.5 text-[13px] font-semibold shadow-none"
            >
              <Save
                className="size-3.5 text-primary-foreground"
                strokeWidth={1.75}
              />
              Save
            </Button>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <Button
                  type="button"
                  size="sm"
                  aria-label="Save options"
                  disabled={viewingOlder}
                  className="h-7 rounded-l-none px-1.5 shadow-none"
                >
                  <ChevronDown
                    className="size-3.5 text-primary-foreground"
                    strokeWidth={1.75}
                  />
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  align="end"
                  sideOffset={4}
                  className="z-50 min-w-[200px] rounded-md border border-border bg-popover p-1.5 text-sm text-popover-foreground shadow-lg"
                >
                  <DropdownMenu.Item
                    onSelect={saveWithoutMessage}
                    className="cursor-pointer rounded-sm px-3 py-1.5 outline-none data-[highlighted]:bg-accent"
                  >
                    Save without message
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    onSelect={() => setComposeOpen(true)}
                    className="cursor-pointer rounded-sm px-3 py-1.5 outline-none data-[highlighted]:bg-accent"
                  >
                    Save with message…
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    onSelect={saveAndExit}
                    className="cursor-pointer rounded-sm px-3 py-1.5 outline-none data-[highlighted]:bg-accent"
                  >
                    Save and Exit
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>

          {composeOpen && (
            <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-[300px] rounded-xl border border-border bg-popover p-3 shadow-lg">
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Save with message
                </p>
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe this version…"
                  className="h-8 text-xs"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveWithMessage();
                    if (e.key === "Escape") {
                      setComposeOpen(false);
                      setMessage("");
                    }
                  }}
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 flex-1 text-xs font-semibold"
                    onClick={() => {
                      setComposeOpen(false);
                      setMessage("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="h-8 flex-1 gap-1.5 text-xs font-semibold"
                    onClick={saveWithMessage}
                  >
                    <Save className="size-3.5" strokeWidth={1.75} />
                    Save
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
