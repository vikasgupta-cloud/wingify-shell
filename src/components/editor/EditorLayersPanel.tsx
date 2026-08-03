import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type LayerNode = {
  id: string;
  name: string;
  children?: LayerNode[];
};

const TREE: LayerNode[] = [
  {
    id: "body",
    name: "Body",
    children: [
      {
        id: "main",
        name: "Main",
        children: [
          {
            id: "header",
            name: "Header",
            children: [
              { id: "logo", name: "Logo" },
              { id: "nav", name: "Nav" },
            ],
          },
          {
            id: "section",
            name: "Section",
            children: [
              { id: "div", name: "Div" },
              { id: "heading", name: "Heading" },
              { id: "img", name: "Img" },
            ],
          },
        ],
      },
    ],
  },
];

function LayerRow({
  node,
  depth,
  selectedId,
  onSelect,
  openIds,
  toggle,
}: {
  node: LayerNode;
  depth: number;
  selectedId: string;
  onSelect: (id: string) => void;
  openIds: Set<string>;
  toggle: (id: string) => void;
}) {
  const hasChildren = Boolean(node.children?.length);
  const open = openIds.has(node.id);
  const selected = selectedId === node.id;

  return (
    <div>
      <button
        type="button"
        onClick={() => onSelect(node.id)}
        className={cn(
          "flex w-full items-center gap-1 rounded-md px-1.5 py-1 text-left text-xs outline-none",
          selected
            ? "bg-accent font-semibold text-foreground"
            : "text-foreground hover:bg-muted"
        )}
        style={{ paddingLeft: 6 + depth * 12 }}
      >
        {hasChildren ? (
          <span
            role="presentation"
            onClick={(e) => {
              e.stopPropagation();
              toggle(node.id);
            }}
            className="inline-flex size-4 items-center justify-center text-muted-foreground"
          >
            {open ? (
              <ChevronDown className="size-3.5" strokeWidth={1.75} />
            ) : (
              <ChevronRight className="size-3.5" strokeWidth={1.75} />
            )}
          </span>
        ) : (
          <span className="size-4" />
        )}
        <span className="truncate">{node.name}</span>
      </button>
      {hasChildren && open &&
        node.children!.map((child) => (
          <LayerRow
            key={child.id}
            node={child}
            depth={depth + 1}
            selectedId={selectedId}
            onSelect={onSelect}
            openIds={openIds}
            toggle={toggle}
          />
        ))}
    </div>
  );
}

function filterTree(nodes: LayerNode[], q: string): LayerNode[] {
  if (!q.trim()) return nodes;
  const needle = q.trim().toLowerCase();
  const walk = (node: LayerNode): LayerNode | null => {
    const kids = node.children
      ?.map(walk)
      .filter((n): n is LayerNode => n != null);
    if (node.name.toLowerCase().includes(needle) || (kids && kids.length > 0)) {
      return { ...node, children: kids };
    }
    return null;
  };
  return nodes.map(walk).filter((n): n is LayerNode => n != null);
}

/** Left Layers panel — DOM tree for the preview page. */
export function EditorLayersPanel({ onClose }: { onClose?: () => void }) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("section");
  const [openIds, setOpenIds] = useState(
    () => new Set(["body", "main", "header", "section"])
  );
  const [searchOpen, setSearchOpen] = useState(false);

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const visible = filterTree(TREE, query);

  return (
    <aside className="flex h-full w-full flex-col bg-background">
      <div className="flex h-9 shrink-0 items-center justify-between border-b border-border px-3">
        <p className="text-sm font-semibold text-foreground">Layers</p>
        <div className="flex items-center gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7"
            aria-label="Search layers"
            aria-pressed={searchOpen}
            onClick={() => setSearchOpen((v) => !v)}
          >
            <Search className="size-3.5" strokeWidth={1.75} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7"
            aria-label="Close"
            onClick={onClose}
          >
            <X className="size-4" strokeWidth={1.75} />
          </Button>
        </div>
      </div>

      {searchOpen && (
        <div className="border-b border-border px-3 py-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search layers…"
            className="h-7 text-xs shadow-none"
            autoFocus
          />
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
        {visible.length === 0 ? (
          <p className="px-2 py-6 text-center text-xs text-muted-foreground">
            No layers match “{query}”.
          </p>
        ) : (
          visible.map((node) => (
            <LayerRow
              key={node.id}
              node={node}
              depth={0}
              selectedId={selectedId}
              onSelect={setSelectedId}
              openIds={openIds}
              toggle={toggle}
            />
          ))
        )}
      </div>

      <div className="shrink-0 space-y-2 border-t border-border p-3">
        <Button
          type="button"
          className="h-8 w-full text-xs font-semibold"
          onClick={() => setSelectedId("section")}
        >
          Select main container
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-8 w-full text-xs font-semibold"
          disabled
          title="Requires a live selection"
        >
          Select same CSS class
        </Button>
      </div>
    </aside>
  );
}
