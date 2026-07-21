import { MarkerType, type Edge, type Node, type XYPosition } from "@xyflow/react";
import type { CampaignConfig } from "../../../store/config";

// Node ids are stable and derived from the config so local position state can
// be merged across re-renders (see WorkflowMode).
export const FIXED_NODE_IDS = {
  traffic: "traffic-allocation",
  target: "target",
  excluded: "excluded",
  split: "traffic-split",
  addVariation: "add-variation",
} as const;

export const variationNodeId = (variationId: string) => `variation-${variationId}`;

// Seed dimensions so nodes are laid out (and edges routed) before react-flow's
// ResizeObserver measures the real DOM — this avoids the pre-measure "hidden"
// flash and keeps the graph functional in environments where RO is unreliable.
// Real measurements refine these on mount.
const INITIAL_SIZE: Record<string, { w: number; h: number }> = {
  [FIXED_NODE_IDS.traffic]: { w: 280, h: 150 },
  [FIXED_NODE_IDS.target]: { w: 320, h: 172 },
  [FIXED_NODE_IDS.excluded]: { w: 320, h: 60 },
  [FIXED_NODE_IDS.split]: { w: 160, h: 90 },
  [FIXED_NODE_IDS.addVariation]: { w: 360, h: 52 },
};
const VARIATION_SIZE = { w: 360, h: 120 };

// Initial left-to-right layout. Only used as the starting position for a node
// the first time it appears — dragging afterwards is the user's.
export function defaultPositions(config: CampaignConfig): Record<string, XYPosition> {
  const positions: Record<string, XYPosition> = {
    [FIXED_NODE_IDS.traffic]: { x: 0, y: 240 },
    [FIXED_NODE_IDS.target]: { x: 400, y: 200 },
    [FIXED_NODE_IDS.excluded]: { x: 400, y: 440 },
    [FIXED_NODE_IDS.split]: { x: 800, y: 240 },
  };
  config.variations.forEach((v, i) => {
    positions[variationNodeId(v.id)] = { x: 1000, y: i * 180 };
  });
  // The "Add variation" affordance sits just below the last variation.
  positions[FIXED_NODE_IDS.addVariation] = {
    x: 1000,
    y: config.variations.length * 180,
  };
  return positions;
}

// Pure derivation of nodes + edges from the config, given a resolved set of
// positions (merged local state ∪ defaults for new nodes).
export function buildGraph(
  campaignId: string,
  config: CampaignConfig,
  positions: Record<string, XYPosition>
): { nodes: Node[]; edges: Edge[] } {
  const at = (id: string) =>
    positions[id] ?? defaultPositions(config)[id] ?? { x: 0, y: 0 };

  const sized = (id: string) => {
    const s = INITIAL_SIZE[id] ?? VARIATION_SIZE;
    return { initialWidth: s.w, initialHeight: s.h };
  };

  const nodes: Node[] = [
    {
      id: FIXED_NODE_IDS.traffic,
      type: "trafficAllocation",
      position: at(FIXED_NODE_IDS.traffic),
      data: { campaignId },
      ...sized(FIXED_NODE_IDS.traffic),
    },
    {
      id: FIXED_NODE_IDS.target,
      type: "target",
      position: at(FIXED_NODE_IDS.target),
      data: { campaignId },
      ...sized(FIXED_NODE_IDS.target),
    },
    {
      id: FIXED_NODE_IDS.excluded,
      type: "excluded",
      position: at(FIXED_NODE_IDS.excluded),
      data: { campaignId },
      ...sized(FIXED_NODE_IDS.excluded),
    },
    {
      id: FIXED_NODE_IDS.split,
      type: "trafficSplit",
      position: at(FIXED_NODE_IDS.split),
      data: { campaignId },
      ...sized(FIXED_NODE_IDS.split),
    },
    ...config.variations.map<Node>((v) => ({
      id: variationNodeId(v.id),
      type: "variation",
      position: at(variationNodeId(v.id)),
      data: { campaignId, variationId: v.id },
      ...sized(variationNodeId(v.id)),
    })),
    {
      id: FIXED_NODE_IDS.addVariation,
      type: "addVariation",
      position: at(FIXED_NODE_IDS.addVariation),
      data: { campaignId },
      draggable: false,
      ...sized(FIXED_NODE_IDS.addVariation),
    },
  ];

  const stroke = "hsl(var(--foreground) / 0.6)";
  const marker = { type: MarkerType.ArrowClosed, color: "hsl(var(--foreground) / 0.6)" };

  const edges: Edge[] = [
    {
      id: "e-traffic-target",
      source: FIXED_NODE_IDS.traffic,
      target: FIXED_NODE_IDS.target,
      type: "smoothstep",
      style: { stroke },
      markerEnd: marker,
    },
    {
      id: "e-traffic-excluded",
      source: FIXED_NODE_IDS.traffic,
      target: FIXED_NODE_IDS.excluded,
      type: "smoothstep",
      style: { stroke, strokeDasharray: "6 4" },
      markerEnd: marker,
    },
    {
      id: "e-target-split",
      source: FIXED_NODE_IDS.target,
      target: FIXED_NODE_IDS.split,
      type: "smoothstep",
      style: { stroke },
      markerEnd: marker,
    },
    ...config.variations.map<Edge>((v) => ({
      id: `e-split-${v.id}`,
      source: FIXED_NODE_IDS.split,
      target: variationNodeId(v.id),
      type: "smoothstep",
      style: { stroke },
      markerEnd: marker,
    })),
  ];

  return { nodes, edges };
}
