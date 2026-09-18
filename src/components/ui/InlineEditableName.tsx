/** Inline name edit — single-click keeps link/button behavior; double-click renames. */

import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const CLICK_DELAY_MS = 280;

export default function InlineEditableName({
  name,
  onRename,
  to,
  className,
  inputClassName,
  title,
}: {
  name: string;
  onRename: (next: string) => void;
  /** When set, single-click navigates here; double-click renames. */
  to?: string;
  className?: string;
  inputClassName?: string;
  title?: string;
}) {
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);
  const clickTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!editing) setDraft(name);
  }, [name, editing]);

  useEffect(() => {
    if (editing) {
      requestAnimationFrame(() => inputRef.current?.select());
    }
  }, [editing]);

  useEffect(
    () => () => {
      window.clearTimeout(clickTimer.current);
    },
    []
  );

  const startEdit = () => {
    window.clearTimeout(clickTimer.current);
    clickTimer.current = undefined;
    setDraft(name);
    setEditing(true);
  };

  const commit = () => {
    const next = draft.trim();
    setEditing(false);
    if (!next || next === name) return;
    onRename(next);
  };

  const cancel = () => {
    setEditing(false);
    setDraft(name);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancel();
    }
  };

  if (editing) {
    return (
      <Input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={onKeyDown}
        aria-label="Rename"
        className={cn(
          "h-7 min-w-[8rem] max-w-full px-1.5 text-sm font-medium shadow-none",
          inputClassName
        )}
        onClick={(e) => e.stopPropagation()}
      />
    );
  }

  const onDoubleClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    startEdit();
  };

  if (to) {
    return (
      <Link
        to={to}
        title={title ?? name}
        className={className}
        onClick={(e) => {
          e.preventDefault();
          window.clearTimeout(clickTimer.current);
          clickTimer.current = window.setTimeout(() => {
            clickTimer.current = undefined;
            navigate(to);
          }, CLICK_DELAY_MS);
        }}
        onDoubleClick={onDoubleClick}
      >
        {name}
      </Link>
    );
  }

  return (
    <span
      title={title ?? name}
      className={cn("cursor-default", className)}
      onDoubleClick={onDoubleClick}
    >
      {name}
    </span>
  );
}
