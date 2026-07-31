import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { EditorTopBar } from "@/components/editor/EditorTopBar";
import { EditorVariationBar } from "@/components/editor/EditorVariationBar";
import { EditorToolRail } from "@/components/editor/EditorToolRail";
import { EditorCanvas } from "@/components/editor/EditorCanvas";
import { EditorCopilotPanel } from "@/components/editor/EditorCopilotPanel";

/**
 * Full-tab visual editor — Global Layout / Default from Figma.
 * Opened from campaign config via Launch Editor.
 */
export default function EditorPage() {
  const { entityId, variationId } = useParams<{
    entityId: string;
    variationId: string;
  }>();
  const [copilotOpen, setCopilotOpen] = useState(true);

  useEffect(() => {
    const previous = document.title;
    document.title = "Editor · Wingify";
    return () => {
      document.title = previous;
    };
  }, []);

  return (
    <div
      className="flex h-screen flex-col overflow-hidden bg-background"
      data-campaign-id={entityId}
      data-variation-id={variationId}
    >
      <EditorTopBar />
      <div className="flex min-h-0 flex-1">
        <EditorToolRail />
        <div className="flex min-w-0 flex-1 flex-col">
          <EditorVariationBar />
          <EditorCanvas />
        </div>
        {copilotOpen && (
          <EditorCopilotPanel onClose={() => setCopilotOpen(false)} />
        )}
      </div>
    </div>
  );
}
