const PREVIEW_SRC = "/editor-preview/index.html";

/**
 * Center stage: the customer website loaded full-width in the canvas.
 */
export function EditorCanvas({
  src = PREVIEW_SRC,
}: {
  src?: string;
}) {
  return (
    <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden bg-background">
      <iframe
        title="Website preview"
        src={src}
        className="absolute inset-0 size-full border-0 bg-background"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      />
    </div>
  );
}
