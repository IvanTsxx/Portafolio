"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

gsap.registerPlugin(useGSAP);

const BRAND_GREEN = "oklch(0.7227 0.192 149.58)";

// line configs: [x1, y1, x2, y2, opacity]
const LINES: [number, number, number, number, number][] = [
  [100, 80, 800, 80, 0.12],
  [100, 200, 800, 200, 0.12],
  [200, 80, 200, 140, 0.18],
  [450, 80, 450, 60, 0.18],
  [700, 80, 700, 140, 0.18],
  [160, 200, 160, 160, 0.18],
  [340, 200, 340, 140, 0.18],
  [560, 200, 560, 140, 0.18],
  [740, 200, 740, 160, 0.18],
  [200, 140, 340, 140, 0.15],
  [560, 140, 700, 140, 0.15],
  [160, 160, 340, 160, 0.1],
  [560, 160, 740, 160, 0.1],
];

function lineLength(x1: number, y1: number, x2: number, y2: number) {
  return Math.hypot(x2 - x1, y2 - y1);
}

export function SvgHero() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          reduceMotion: "(prefers-reduced-motion: reduce)",
          normal: "(prefers-reduced-motion: no-preference)",
        },
        (ctx) => {
          const { reduceMotion } = ctx.conditions as {
            reduceMotion: boolean;
            normal: boolean;
          };

          if (reduceMotion) {
            gsap.set(".svg-line", { strokeDashoffset: 0 });
            gsap.set([".svg-node", ".svg-label", ".svg-bracket"], {
              autoAlpha: 1,
            });
            return;
          }

          const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });

          // bracket paths: animate strokeDashoffset
          tl.to(".svg-bracket", {
            strokeDashoffset: 0,
            duration: 0.85,
            stagger: 0.14,
          });

          // circuit lines
          tl.to(
            ".svg-line",
            {
              strokeDashoffset: 0,
              duration: 0.65,
              stagger: 0.06,
            },
            "-=0.45"
          );

          // nodes pop in
          tl.from(
            ".svg-node",
            {
              scale: 0,
              autoAlpha: 0,
              duration: 0.3,
              stagger: 0.055,
              ease: "back.out(1.7)",
              transformOrigin: "center center",
            },
            "-=0.3"
          );

          // labels fade in
          tl.from(
            ".svg-label",
            {
              autoAlpha: 0,
              y: 5,
              duration: 0.35,
              stagger: 0.05,
              ease: "power2.out",
            },
            "-=0.15"
          );

          // idle pulse on accent nodes — continuous
          gsap.to(".svg-pulse", {
            scale: 1.7,
            autoAlpha: 0,
            duration: 1.6,
            ease: "power2.out",
            stagger: { each: 0.55, repeat: -1 },
            transformOrigin: "center center",
          });
        }
      );

      return () => {
        mm.revert();
      };
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="w-full overflow-hidden border-b border-border"
      style={{ height: "clamp(160px, 26vw, 320px)" }}
    >
      <svg
        viewBox="0 0 900 280"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full"
        aria-hidden="true"
      >
        <defs>
          {/* Left bracket path length ≈ 320 */}
          <path
            id="bracket-left"
            d="M 80 60 L 48 60 L 48 220 L 80 220"
          />
          {/* Right bracket path length ≈ 320 */}
          <path
            id="bracket-right"
            d="M 820 60 L 852 60 L 852 220 L 820 220"
          />
        </defs>

        {/* ── Brackets ──────────────────────────────────────────── */}
        <use
          href="#bracket-left"
          className="svg-bracket"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          opacity="0.22"
          strokeDasharray="320"
          strokeDashoffset="320"
        />
        <use
          href="#bracket-right"
          className="svg-bracket"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          opacity="0.22"
          strokeDasharray="320"
          strokeDashoffset="320"
        />

        {/* ── Circuit lines ──────────────────────────────────────── */}
        {LINES.map(([x1, y1, x2, y2, op], i) => {
          const len = lineLength(x1, y1, x2, y2);
          return (
            <line
              key={i}
              className="svg-line"
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="currentColor"
              strokeWidth="1"
              opacity={op}
              strokeDasharray={len}
              strokeDashoffset={len}
            />
          );
        })}

        {/* ── Nodes: spine intersections ────────────────────────── */}
        {(
          [
            [200, 80, 3],
            [450, 80, 3],
            [700, 80, 3],
            [160, 200, 3],
            [340, 200, 3],
            [560, 200, 3],
            [740, 200, 3],
            [200, 140, 2.5],
            [340, 140, 2.5],
            [560, 140, 2.5],
            [700, 140, 2.5],
          ] as [number, number, number][]
        ).map(([cx, cy, r], i) => (
          <circle
            key={i}
            className="svg-node"
            cx={cx}
            cy={cy}
            r={r}
            fill="currentColor"
            opacity="0.28"
          />
        ))}

        {/* ── Accent nodes with pulse rings ─────────────────────── */}
        {(
          [
            [450, 140, 4.5, 9],
            [160, 160, 3.5, 7],
            [740, 160, 3.5, 7],
            [450, 60, 3, 6],
          ] as [number, number, number, number][]
        ).map(([cx, cy, r, pr], i) => (
          <g key={i}>
            <circle
              className="svg-pulse"
              cx={cx}
              cy={cy}
              r={pr}
              fill="none"
              stroke={BRAND_GREEN}
              strokeWidth="1"
              opacity="0.35"
            />
            <circle
              className="svg-node"
              cx={cx}
              cy={cy}
              r={r}
              fill={BRAND_GREEN}
              opacity={i === 0 ? 0.9 : 0.7}
            />
          </g>
        ))}

        {/* ── Labels ────────────────────────────────────────────── */}
        {(
          [
            [84, 57, "IVB", "currentColor", 0.3],
            [422, 46, "v1.0", BRAND_GREEN, 0.65],
            [820, 57, "dev", "currentColor", 0.3],
            [430, 153, "next.js", BRAND_GREEN, 0.5],
            [356, 133, "api", "currentColor", 0.2],
            [706, 133, "ui", "currentColor", 0.2],
            [168, 153, "db", "currentColor", 0.2],
            [747, 153, "ts", "currentColor", 0.2],
          ] as [number, number, string, string, number][]
        ).map(([x, y, text, fill, opacity], i) => (
          <text
            key={i}
            className="svg-label"
            x={x}
            y={y}
            fill={fill}
            fontSize="8.5"
            opacity={opacity}
            fontFamily="monospace"
            letterSpacing="0.05em"
          >
            {text}
          </text>
        ))}
      </svg>
    </div>
  );
}
