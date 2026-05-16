import type { CSSProperties, FC } from "react";

type MagicBentoCard = {
  color?: string;
  title: string;
  description: string;
  label?: string;
  className?: string;
  style?: CSSProperties;
};

type MagicBentoProps = {
  cards?: MagicBentoCard[];
  textAutoHide?: boolean;
  enableStars?: boolean;
  enableSpotlight?: boolean;
  enableBorderGlow?: boolean;
  disableAnimations?: boolean;
  spotlightRadius?: number;
  particleCount?: number;
  enableTilt?: boolean;
  glowColor?: string;
  clickEffect?: boolean;
  enableMagnetism?: boolean;
  className?: string;
  gridClassName?: string;
};

declare const MagicBento: FC<MagicBentoProps>;

export default MagicBento;
