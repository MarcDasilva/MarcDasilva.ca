declare module "@/components/StickerPeel" {
  import { ComponentType } from "react";

  export type StickerPeelProps = {
    imageSrc: string;
    rotate?: number;
    peelBackHoverPct?: number;
    peelBackActivePct?: number;
    peelEasing?: string;
    peelHoverEasing?: string;
    width?: number;
    shadowIntensity?: number;
    lightingIntensity?: number;
    initialPosition?: "center" | { x: number; y: number };
    peelDirection?: number;
    className?: string;
    onDragEnd?: (x: number, y: number) => void;
    clampOnResize?: boolean;
    activateAfterMs?: number;
    disablePeel?: boolean;
    allowInteraction?: boolean;
  };

  const StickerPeel: ComponentType<StickerPeelProps>;

  export default StickerPeel;
}
