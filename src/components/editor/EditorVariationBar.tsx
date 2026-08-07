export type VariationId = string;
export type CodeScopeId = "campaign" | VariationId;

export type EditorVariationTab = {
  id: VariationId;
  label: string;
  chip: string;
};

export const DEFAULT_VARIATIONS: EditorVariationTab[] = [
  { id: "control", label: "Control", chip: "C" },
  { id: "v1", label: "Variation 01", chip: "V1" },
  { id: "v2", label: "Variation 02", chip: "V2" },
];

export function createNextVariation(
  existing: EditorVariationTab[]
): EditorVariationTab {
  const nums = existing.map((v) => {
    const m = /^v(\d+)$/i.exec(v.id);
    return m ? Number(m[1]) : 0;
  });
  const n = Math.max(0, ...nums) + 1;
  const pad = String(n).padStart(2, "0");
  return {
    id: `v${n}`,
    label: `Variation ${pad}`,
    chip: `V${n}`,
  };
}
