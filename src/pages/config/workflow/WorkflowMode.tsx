import { useEffect, useMemo } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Button } from "@/components/ui/button";
import { useConfigStore } from "../../../store/config";
import EditorBar from "./EditorBar";
import { nodeTypes } from "./nodes";
import { buildGraph, FIXED_NODE_IDS } from "./graph";

// Vertical gap kept between the bottom of the Target node and the top of the
// Excluded node, so the latter never hides behind the former when Target grows.
const EXCLUDED_GAP = 40;

// Neutralise react-flow's default (blue) accents so everything reads grayscale.
const canvasVars = {
  "--xy-edge-stroke-default": "hsl(var(--foreground) / 0.6)",
  "--xy-edge-stroke-selected-default": "hsl(var(--foreground))",
  "--xy-controls-button-background-color-default": "hsl(var(--background))",
  "--xy-controls-button-background-color-hover-default": "hsl(var(--accent))",
  "--xy-controls-button-color-default": "hsl(var(--foreground))",
  "--xy-controls-button-color-hover-default": "hsl(var(--foreground))",
  "--xy-controls-button-border-color-default": "hsl(var(--border))",
} as React.CSSProperties;

export default function WorkflowMode({ id }: { id: string }) {
  const config = useConfigStore((s) => s.configs[id]);
  const closeWorkflow = useConfigStore((s) => s.closeWorkflow);
  const discardWorkflow = useConfigStore((s) => s.discardWorkflow);

  // Node positions and layout are LOCAL, derived from the config, never
  // persisted. react-flow owns node internals (position + measured size) so
  // edges can resolve their handle bounds; onNodesChange lets it manage both.
  const [nodes, setNodes, onNodesChange] = useNodesState(
    config ? buildGraph(id, config, {}).nodes : []
  );
  const [edges, setEdges] = useEdgesState(
    config ? buildGraph(id, config, {}).edges : []
  );

  // Reconcile ONLY when the set of variation nodes changes (add/remove) — never
  // on every config edit, so react-flow keeps each node's measured size and the
  // user's dragged positions. Rebuilding the whole array on a slider tick would
  // wipe react-flow's internals and leave nodes/edges unmeasured.
  const variationKey = useMemo(
    () => config?.variations.map((v) => v.id).join(",") ?? "",
    [config?.variations]
  );
  useEffect(() => {
    if (!config) return;
    const desired = buildGraph(id, config, {});
    setNodes((prev) => {
      const byId = new Map(prev.map((n) => [n.id, n]));
      // Keep surviving nodes verbatim (position + measured); add new ones. The
      // "Add variation" node is the exception — it must re-anchor below the new
      // last variation, so always take its freshly computed position.
      return desired.nodes.map((d) =>
        d.id === FIXED_NODE_IDS.addVariation ? d : byId.get(d.id) ?? d
      );
    });
    setEdges(desired.edges);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, variationKey, setNodes, setEdges]);

  // Keep the Excluded node anchored just below the Target node as Target's
  // height changes (e.g. when Additional options expand), so it is never hidden
  // behind it. Runs only once Target has been measured.
  const targetNode = nodes.find((n) => n.id === FIXED_NODE_IDS.target);
  const targetHeight = targetNode?.measured?.height;
  const targetY = targetNode?.position.y;
  useEffect(() => {
    if (targetHeight == null || targetY == null) return;
    const desiredY = targetY + targetHeight + EXCLUDED_GAP;
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id !== FIXED_NODE_IDS.excluded) return n;
        if (Math.abs(n.position.y - desiredY) < 1) return n;
        return { ...n, position: { ...n.position, y: desiredY } };
      })
    );
  }, [targetHeight, targetY, setNodes]);

  if (!config) return null;

  return (
    <div className="flex h-full flex-col bg-canvas">
      <div className="flex shrink-0 items-center justify-between px-6 py-4">
        <h2 className="text-lg font-semibold text-foreground">Workflow Mode</h2>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => discardWorkflow(id)}
          >
            Discard
          </Button>
          <Button type="button" onClick={() => closeWorkflow(id)}>
            Done
          </Button>
        </div>
      </div>

      <div className="relative m-6 mt-0 min-h-0 flex-1 overflow-hidden rounded-lg border border-border bg-background">
        <EditorBar campaignId={id} />

        <div className="h-full w-full" style={canvasVars}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.4}
            maxZoom={1.5}
            nodesDraggable
            nodesConnectable={false}
            edgesFocusable={false}
            proOptions={{ hideAttribution: true }}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={20}
              size={1.6}
              color="hsl(var(--muted-foreground) / 0.35)"
            />
            <Controls
              position="bottom-right"
              showInteractive={false}
              className="!border-border !bg-background !shadow-sm"
            />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}
