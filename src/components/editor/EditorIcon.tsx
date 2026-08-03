import { cn } from "@/lib/utils";

/** Fixed-size Figma-exported icon. Always set both width and height.
 *  Editor chrome stays greyscale — assets are forced to B/W. */
export function EditorIcon({
  src,
  alt = "",
  size = 16,
  className,
}: {
  src: string;
  alt?: string;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden",
        className
      )}
      style={{ width: size, height: size }}
    >
      <img
        src={src}
        alt={alt}
        className="block size-full object-contain grayscale"
      />
    </span>
  );
}
