"use client";

import type { ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import { useInView } from "@/_hooks/useInView";

type Direction = "up" | "down" | "left" | "right" | "fade";

interface RevealProps {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  duration?: number;
  className?: string;
  as?: "div" | "section" | "span";
}

const directionClasses: Record<Direction, string> = {
  up: "translate-y-8",
  down: "-translate-y-8",
  left: "-translate-x-8",
  right: "translate-x-8",
  fade: "translate-y-0",
};

export function Reveal({
  children,
  direction = "up",
  delay = 0,
  duration = 500,
  className,
  as: Tag = "div",
}: RevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>({ once: true, threshold: 0.15 });

  return (
    <Tag
      ref={ref}
      className={twMerge(
        "transition-all ease-out-quart will-change-transform",
        inView
          ? "translate-y-0 translate-x-0 opacity-100"
          : `opacity-0 ${directionClasses[direction]}`,
        className,
      )}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </Tag>
  );
}
