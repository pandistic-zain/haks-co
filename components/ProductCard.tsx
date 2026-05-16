"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { WatchModel, type WatchModelController } from "@/components/three/WatchModel";
import { products } from "@/lib/catalog";

type Product = (typeof products)[number];

type ProductCardProps = {
  product: Product;
  price: string;
  href: string;
  index: number;
};

export function ProductCard({ product, price, href, index }: ProductCardProps) {
  const modelRef = useRef<WatchModelController | null>(null);
  const modelPresets = [
    { rotationY: 0.28, cameraZ: 6.85, targetSize: 4.24, speed: 0.0032, rotX: 0.16, rotZ: -0.06, posY: -1.05, scale: 1.03 },
    { rotationY: 0.5, cameraZ: 6.82, targetSize: 4.28, speed: 0.003, rotX: 0.15, rotZ: -0.06, posY: -1.05, scale: 1.03 },
    { rotationY: 0.72, cameraZ: 6.86, targetSize: 4.2, speed: 0.0033, rotX: 0.16, rotZ: -0.05, posY: -1.05, scale: 1.02 }
  ] as const;
  const preset = modelPresets[index] ?? {
    rotationY: product.rotation,
    cameraZ: 6.85,
    targetSize: 4.2,
    speed: 0.0032,
    rotX: 0.16,
    rotZ: -0.06,
    posY: -1.05,
    scale: 1.02
  };

  useEffect(() => {
    const applyPreset = () => {
      const controller = modelRef.current;
      if (!controller) {
        return;
      }

      controller.setCamera({ x: 0, y: 0.02, z: preset.cameraZ });
      controller.setPose({
        rotX: preset.rotX,
        rotY: preset.rotationY,
        rotZ: preset.rotZ,
        posX: 0,
        posY: preset.posY,
        scale: preset.scale
      });
      controller.setLighting({ key: 5.6, fill: 2.85, ember: 2.7, ambient: 2.75 });
    };

    applyPreset();
    const interval = window.setInterval(applyPreset, 180);
    const timeout = window.setTimeout(() => window.clearInterval(interval), 2600);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [preset.cameraZ, preset.posY, preset.rotX, preset.rotZ, preset.rotationY, preset.scale]);

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.58, delay: index * 0.08 }}
      className="group relative overflow-hidden rounded-[22px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.028),rgba(255,255,255,0.01)_38%,rgba(0,0,0,0.24))] px-5 pb-8 pt-3 text-center shadow-[0_14px_36px_rgba(0,0,0,0.24)] transition duration-300 hover:-translate-y-1 hover:border-ember/30"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(139,32,56,0.23),transparent_52%)] opacity-90 transition duration-300 group-hover:opacity-100" />
      <div className="absolute inset-x-5 top-4 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-[48%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="relative mx-auto -mt-3 h-80 w-full overflow-hidden">
        <div className="h-full">
          <WatchModel
            ref={modelRef}
            className="h-full w-full"
            targetSize={preset.targetSize}
            cameraZ={preset.cameraZ}
            initialRotationY={preset.rotationY}
            autoRotateSpeed={preset.speed}
            interactive={false}
            allowZoom={false}
          />
        </div>
      </div>

      <h3 className="relative z-10 mt-[-4.15rem] font-serif text-[clamp(1.75rem,2.05vw,2.2rem)] font-semibold leading-[0.98] tracking-[-0.012em] text-white">
        {product.name}
      </h3>
      <p className="mx-auto mt-2.5 max-w-xs text-[0.98rem] leading-7 text-white/[0.62]">
        {product.description}
      </p>
      <p className="mt-4 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-emberLight">
        {product.finish}
      </p>

      <div className="mt-5 font-serif text-[clamp(2.05rem,2.5vw,2.55rem)] font-semibold leading-none text-white">
        {price}
        <span className="mt-2 block font-sans text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-emberLight/95">
          Free worldwide shipping
        </span>
      </div>

      <Link
        href={href}
        className="mt-6 inline-flex min-w-[150px] items-center justify-center rounded-full border border-ember/70 bg-transparent px-7 py-3 text-[0.69rem] font-bold uppercase tracking-[0.2em] text-white transition duration-300 hover:-translate-y-0.5 hover:bg-ember/90 hover:shadow-ember"
      >
        Buy Now
      </Link>
    </motion.article>
  );
}
