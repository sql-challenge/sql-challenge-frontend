"use client";

import { useEffect, useRef } from "react";
import { twMerge } from "tailwind-merge";

interface PixelHeroProps {
  className?: string;
}

type Palette = {
  bg: string;
  primary: string;
  accent: string;
  foreground: string;
};

type Block = { x: number; y: number; w: number; lit: number; hot: boolean };

const ART_HEIGHT = 180;
const PIXEL_CSS = 3;

export default function PixelHero({ className }: PixelHeroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let running = true;
    let last = 0;
    let w = 0;
    let h = ART_HEIGHT;
    let rScale = 1;
    let columns: Block[] = [];

    const readPalette = (): Palette => {
      const cs = getComputedStyle(document.documentElement);
      const v = (name: string, fallback: string) => cs.getPropertyValue(name).trim() || fallback;
      return {
        bg: v("--background", "#07070d"),
        primary: v("--primary", "#00e5ff"),
        accent: v("--accent", "#ff00ff"),
        foreground: v("--foreground", "#e8e8e8"),
      };
    };

    let palette = readPalette();

    const buildField = () => {
      columns = [];
      const colW = 22 * rScale;
      const gap = 7 * rScale;
      const startY = 12 * rScale;
      for (let x = 10 * rScale; x < w - 14 * rScale; x += colW + gap) {
        const rows = 4 + Math.floor(Math.random() * 4);
        for (let r = 0; r < rows; r++) {
          columns.push({ x, y: startY + r * 4 * rScale, w: colW, lit: Math.random() * 6 + 2, hot: false });
        }
      }
    };

    const layout = () => {
      const rect = canvas.getBoundingClientRect();
      const cssW = Math.max(rect.width, 1);
      const cssH = Math.max(rect.height, 1);
      const aspect = cssW / cssH;
      const dpr = Math.min(window.devicePixelRatio || 1, 3);

      h = Math.max(ART_HEIGHT, Math.round(cssH / PIXEL_CSS));
      rScale = h / ART_HEIGHT;
      w = Math.max(140, Math.round(h * aspect));

      const unit = PIXEL_CSS * dpr;
      canvas.width = Math.max(1, Math.round(w * unit));
      canvas.height = Math.max(1, Math.round(h * unit));
      ctx.setTransform(unit, 0, 0, unit, 0, 0);
      ctx.imageSmoothingEnabled = false;
      buildField();
    };

    const px = (x: number, y: number, bw: number, bh: number, color: string, alpha = 1) => {
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.fillRect(Math.floor(x), Math.floor(y), bw, bh);
      ctx.globalAlpha = 1;
    };

    const line = (x0: number, y0: number, x1: number, y1: number, color: string, alpha = 1) => {
      const dx = x1 - x0;
      const dy = y1 - y0;
      const steps = Math.max(Math.abs(dx), Math.abs(dy));
      if (steps === 0) return;
      for (let i = 0; i <= steps; i += 1) {
        px(x0 + (dx * i) / steps, y0 + (dy * i) / steps, 1, 1, color, alpha);
      }
    };

    const ring = (cx: number, cy: number, r: number, color: string, alpha = 1) => {
      let x = r;
      let y = 0;
      let err = 1 - r;
      while (x >= y) {
        const pts = [
          [x, y], [y, x], [-x, y], [-y, x],
          [-x, -y], [-y, -x], [x, -y], [y, -x],
        ];
        for (const [ox, oy] of pts) px(cx + ox, cy + oy, 1, 1, color, alpha);
        y += 1;
        if (err < 0) err += 2 * y + 1;
        else { x -= 1; err += 2 * (y - x) + 1; }
      }
    };

    const fillCircle = (cx: number, cy: number, r: number, color: string, alpha: number) => {
      for (let y = -r; y <= r; y += 1) {
        const span = Math.floor(Math.sqrt(Math.max(r * r - y * y, 0)));
        px(cx - span, cy + y, span * 2 + 1, 1, color, alpha);
      }
    };

    let t = 0;
    const draw = (dt: number) => {
      t += dt;
      const { bg, primary, accent, foreground } = palette;

      ctx.globalAlpha = 1;
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      const horizon = Math.floor(h * 0.6);
      const cx = Math.floor(w / 2);

      // ── Perspective floor grid ──────────────────────────────
      const spread = w * 0.9;
      const vLines = 14;
      for (let i = 0; i <= vLines; i += 1) {
        const edge = cx + (i / vLines - 0.5) * spread;
        line(cx, horizon, edge, h, primary, 0.16);
      }
      const scroll = (t * 0.16) % 1;
      for (let k = 0; k < 10; k += 1) {
        const f = (k + scroll) / 10;
        const y = horizon + Math.pow(f, 2.2) * (h - horizon);
        line(0, y, w, y, primary, 0.03 + 0.12 * (1 - f));
      }
      px(0, horizon, w, 1, primary, 0.32);

      // ── Data field ──────────────────────────────────────────
      for (const b of columns) {
        b.lit -= dt;
        if (b.lit <= 0) {
          b.lit = Math.random() * 6 + 2;
          b.hot = Math.random() > 0.84;
        }
        const color = b.hot ? accent : foreground;
        const alpha = b.hot ? 0.85 : 0.2;
        for (let c = 0; c < b.w; c += 3) {
          px(b.x + c, b.y, 2, 2, color, alpha);
        }
        if (b.hot) {
          line(b.x - 1, b.y - 2, b.x + b.w, b.y - 2, accent, 0.55);
          line(b.x - 1, b.y + 3, b.x + b.w, b.y + 3, accent, 0.55);
        }
      }

      // ── Magnifier ───────────────────────────────────────────
      const mr = 26 * rScale;
      const mcx = cx + Math.sin(t * 0.28) * (w * 0.28);
      const mcy = horizon * 0.56 + Math.cos(t * 0.21) * (horizon * 0.3);

      fillCircle(mcx, mcy, mr, primary, 0.07);
      for (let gy = -mr; gy <= mr; gy += 4) line(mcx - mr, mcy + gy, mcx + mr, mcy + gy, primary, 0.2);
      for (let gx = -mr; gx <= mr; gx += 4) line(mcx + gx, mcy - mr, mcx + gx, mcy + mr, primary, 0.2);

      line(mcx - 12 * rScale, mcy + 6 * rScale, mcx + 10 * rScale, mcy - 8 * rScale, accent, 0.85);
      px(mcx - 12 * rScale, mcy + 6 * rScale, 2, 2, accent, 1);
      px(mcx + 10 * rScale, mcy - 8 * rScale, 2, 2, accent, 1);

      ring(mcx, mcy, mr, primary, 1);
      ring(mcx, mcy, mr - 1, primary, 0.3);

      line(mcx + mr * 0.72, mcy + mr * 0.72, mcx + mr * 1.16, mcy + mr * 1.16, primary, 1);
      line(mcx + mr * 0.72, mcy + mr * 0.72 + 1, mcx + mr * 1.16 + 1, mcy + mr * 1.16, primary, 1);

      if (Math.floor(t * 2) % 2 === 0) px(mcx - 14 * rScale, mcy - 10 * rScale, 4, 2, foreground, 0.9);
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.innerWidth < 768;

    layout();
    if (reduced || small) {
      draw(0);
      return;
    }

    const loop = (now: number) => {
      if (!running) return;
      raf = requestAnimationFrame(loop);
      if (now - last < 33) return; // ~30fps
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      draw(dt);
    };
    last = performance.now();
    raf = requestAnimationFrame(loop);

    const onResize = () => {
      layout();
    };
    window.addEventListener("resize", onResize);

    const observer = new MutationObserver(() => {
      palette = readPalette();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      observer.disconnect();
    };
  }, []);

  return (
    <div className={twMerge("fixed inset-0 -z-10 pointer-events-none", className)}>
      <canvas ref={canvasRef} className="h-full w-full [image-rendering:pixelated]" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/50 to-background" />
    </div>
  );
}
