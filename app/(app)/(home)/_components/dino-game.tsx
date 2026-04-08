// oxlint-disable promise/prefer-await-to-then
// oxlint-disable max-lines
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// ─── Constants ────────────────────────────────────────────────
const CANVAS_W = 800;
const CANVAS_H = 200;
const GROUND_Y = 160;
const GRAVITY = 0.6;
const JUMP_FORCE = -13;
const DINO_W = 44;
const DINO_H = 48;
const DINO_X = 80;
const MIN_OBSTACLE_GAP = 320;
const BASE_SPEED = 5;
const SPEED_INCREMENT = 0.0008;

// Obstacle colors for random generation
const OBSTACLE_COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

// ─── Types ─────────────────────────────────────────────────────
interface Obstacle {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  shape: "rect" | "cactus";
}

interface GameState {
  dinoY: number;
  velY: number;
  isOnGround: boolean;
  obstacles: Obstacle[];
  score: number;
  speed: number;
  gameOver: boolean;
  started: boolean;
  groundOffset: number;
  blink: number;
}

// ─── Pixel-art dino drawing ────────────────────────────────────
// We draw a simple pixel dino using fillRect calls.
// Each sub-array is a row of pixels (1 = fill, 0 = skip).
const DINO_PIXELS = [
  [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0],
  [0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
  [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
  [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
  [0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0],
  [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0],
  [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0],
];

function drawDino(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  frame: number
) {
  const pw = DINO_W / DINO_PIXELS[0].length;
  const ph = DINO_H / DINO_PIXELS.length;

  ctx.fillStyle = color;
  DINO_PIXELS.forEach((row, ri) => {
    row.forEach((px, ci) => {
      if (px === 1) {
        ctx.fillRect(x + ci * pw, y + ri * ph, pw, ph);
      }
    });
  });

  // Legs (animated)
  const legSplit = frame % 2 === 0;
  const legY = y + DINO_H;
  ctx.fillStyle = color;
  if (legSplit) {
    ctx.fillRect(x + pw * 3, legY, pw * 2, ph * 2);
    ctx.fillRect(x + pw * 6, legY + ph, pw * 2, ph * 2);
  } else {
    ctx.fillRect(x + pw * 3, legY + ph, pw * 2, ph * 2);
    ctx.fillRect(x + pw * 6, legY, pw * 2, ph * 2);
  }
}

// ─── Draw procedural obstacles ────────────────────────────────
function drawObstacle(ctx: CanvasRenderingContext2D, ob: Obstacle) {
  ctx.fillStyle = ob.color;
  if (ob.shape === "cactus") {
    // Draw cactus-like shape
    const { w } = ob;
    const { h } = ob;
    const { x } = ob;
    const { y } = ob;
    // Main stem
    ctx.fillRect(x + w * 0.3, y, w * 0.4, h);
    // Left arm
    ctx.fillRect(x, y + h * 0.3, w * 0.3, h * 0.2);
    ctx.fillRect(x, y + h * 0.15, w * 0.15, h * 0.35);
    // Right arm
    ctx.fillRect(x + w * 0.7, y + h * 0.4, w * 0.3, h * 0.2);
    ctx.fillRect(x + w * 0.85, y + h * 0.2, w * 0.15, h * 0.4);
  } else {
    // Simple rect with rounded effect
    ctx.fillRect(ob.x, ob.y, ob.w, ob.h);
  }
}

// ─── Component ─────────────────────────────────────────────────
export function DinoGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState>({
    blink: 0,
    dinoY: GROUND_Y - DINO_H,
    gameOver: false,
    groundOffset: 0,
    isOnGround: true,
    obstacles: [],
    score: 0,
    speed: BASE_SPEED,
    started: false,
    velY: 0,
  });
  const rafRef = useRef<number | null>(null);
  const frameRef = useRef(0);
  const nextObstacleRef = useRef(
    MIN_OBSTACLE_GAP + Math.random() * MIN_OBSTACLE_GAP
  );
  const [displayScore, setDisplayScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isStarted, setIsStarted] = useState(false);

  // Read CSS vars for theming (updated on every frame via ref)
  const colorsRef = useRef({ bg: "#fff", fg: "#000", muted: "#888" });

  const readColors = useCallback(() => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;
    const style = getComputedStyle(root);
    // Try to get computed OKLCH and convert; we use the canvas background trick
    const canv = document.createElement("canvas");
    // oxlint-disable-next-line no-multi-assign
    canv.width = canv.height = 1;
    const cx = canv.getContext("2d");
    if (!cx) return;

    const setFromVar = (varName: string): string => {
      cx.clearRect(0, 0, 1, 1);
      cx.fillStyle = style.getPropertyValue(varName).trim() || "#000";
      cx.fillRect(0, 0, 1, 1);
      const d = cx.getImageData(0, 0, 1, 1).data;
      return `rgb(${d[0]},${d[1]},${d[2]})`;
    };

    colorsRef.current = {
      bg: setFromVar("--background"),
      fg: setFromVar("--foreground"),
      muted: setFromVar("--muted-foreground"),
    };
  }, []);

  const resetGame = useCallback(() => {
    stateRef.current = {
      blink: 0,
      dinoY: GROUND_Y - DINO_H,
      gameOver: false,
      groundOffset: 0,
      isOnGround: true,
      obstacles: [],
      score: 0,
      speed: BASE_SPEED,
      started: true,
      velY: 0,
    };
    frameRef.current = 0;
    nextObstacleRef.current =
      MIN_OBSTACLE_GAP + Math.random() * MIN_OBSTACLE_GAP;
    setDisplayScore(0);
    setIsGameOver(false);
    setIsStarted(true);
  }, []);

  const jump = useCallback(() => {
    const s = stateRef.current;
    if (!s.started) {
      resetGame();
      return;
    }
    if (s.gameOver) {
      resetGame();
      return;
    }
    if (s.isOnGround) {
      s.velY = JUMP_FORCE;
      s.isOnGround = false;
    }
  }, [resetGame]);

  // Keyboard handler (global — Space/ArrowUp only, no ambiguity)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [jump]);

  // Read colors once on mount
  useEffect(() => {
    readColors();
  }, [readColors]);

  // Update colors when theme changes (MutationObserver on class)
  useEffect(() => {
    const obs = new MutationObserver(readColors);
    obs.observe(document.documentElement, {
      attributeFilter: ["class"],
      attributes: true,
    });
    return () => obs.disconnect();
  }, [readColors]);

  // ─── Game loop ─────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const getRandomObstacle = (startX: number): Obstacle => {
      const colors = OBSTACLE_COLORS;
      const color = colors[Math.floor(Math.random() * colors.length)];
      // Random height variation (low / high obstacle)
      const isCactus = Math.random() > 0.5;
      const baseSize = 30 + Math.random() * 15;
      const w = isCactus ? baseSize : baseSize * 0.8;
      const h = isCactus ? baseSize * 1.5 : baseSize;
      const tall = Math.random() > 0.65;
      const y = tall ? GROUND_Y - h - 25 : GROUND_Y - h;
      return {
        color,
        h,
        shape: isCactus ? "cactus" : "rect",
        w,
        x: startX,
        y,
      };
    };

    const loop = () => {
      const s = stateRef.current;
      const { fg, bg, muted } = colorsRef.current;
      frameRef.current += 1;

      // ── Clear ──────────────────────────────────────────────
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      // ── Not started ────────────────────────────────────────
      if (!s.started) {
        // Draw static dino
        drawDino(ctx, DINO_X, GROUND_Y - DINO_H, fg, 0);

        // Ground
        ctx.fillStyle = fg;
        ctx.fillRect(0, GROUND_Y, CANVAS_W, 2);

        // Hint text
        ctx.fillStyle = muted;
        ctx.font = "14px monospace";
        ctx.textAlign = "center";
        ctx.fillText(
          "Press SPACE or tap to start",
          CANVAS_W / 2,
          GROUND_Y + 30
        );

        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      if (!s.gameOver) {
        // ── Physics ──────────────────────────────────────────
        s.velY += GRAVITY;
        s.dinoY += s.velY;

        if (s.dinoY >= GROUND_Y - DINO_H) {
          s.dinoY = GROUND_Y - DINO_H;
          s.velY = 0;
          s.isOnGround = true;
        }

        // ── Speed & Score ────────────────────────────────────
        s.speed = BASE_SPEED + s.score * SPEED_INCREMENT;
        s.score += 1;
        s.groundOffset = (s.groundOffset + s.speed) % CANVAS_W;

        if (s.score % 3 === 0) setDisplayScore(Math.floor(s.score / 10));

        // ── Obstacles ────────────────────────────────────────
        nextObstacleRef.current -= s.speed;
        if (nextObstacleRef.current <= 0) {
          s.obstacles.push(getRandomObstacle(CANVAS_W + 50));
          nextObstacleRef.current =
            MIN_OBSTACLE_GAP + Math.random() * MIN_OBSTACLE_GAP;
        }
        s.obstacles = s.obstacles
          .map((ob) => ({ ...ob, x: ob.x - s.speed }))
          .filter((ob) => ob.x + ob.w > -20);

        // ── Collision ────────────────────────────────────────
        const margin = 4;
        const dinoBox = {
          h: DINO_H - margin * 2,
          w: DINO_W - margin * 2,
          x: DINO_X + margin,
          y: s.dinoY + margin,
        };
        for (const ob of s.obstacles) {
          const hit =
            dinoBox.x < ob.x + ob.w - margin &&
            dinoBox.x + dinoBox.w > ob.x + margin &&
            dinoBox.y < ob.y + ob.h - margin &&
            dinoBox.y + dinoBox.h > ob.y + margin;
          if (hit) {
            s.gameOver = true;
            setIsGameOver(true);
            break;
          }
        }
      } else {
        s.blink += 1;
      }

      // ── Draw Ground ──────────────────────────────────────
      ctx.fillStyle = fg;
      ctx.fillRect(0, GROUND_Y, CANVAS_W, 2);
      // Ground dots pattern
      ctx.fillStyle = muted;
      for (let gx = 0; gx < CANVAS_W; gx += 20) {
        const dotX = (gx - s.groundOffset + CANVAS_W) % CANVAS_W;
        ctx.fillRect(dotX, GROUND_Y + 4, 3, 2);
        ctx.fillRect(dotX + 8, GROUND_Y + 6, 6, 2);
      }

      // ── Draw Dino ────────────────────────────────────────
      const legFrame = s.isOnGround ? Math.floor(frameRef.current / 8) : 0;
      drawDino(ctx, DINO_X, s.dinoY, fg, legFrame);

      // ── Draw Obstacles ────────────────────────────────────
      for (const ob of s.obstacles) {
        drawObstacle(ctx, ob);
      }

      // ── Game Over overlay ─────────────────────────────────
      if (s.gameOver) {
        const show = Math.floor(s.blink / 20) % 2 === 0;
        ctx.fillStyle = fg;
        ctx.font = "bold 20px monospace";

        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", CANVAS_W / 2, GROUND_Y / 2 - 10);
        if (show) {
          ctx.fillStyle = muted;
          ctx.font = "13px monospace";
          ctx.fillText(
            "Press SPACE or tap to restart",
            CANVAS_W / 2,
            GROUND_Y / 2 + 16
          );
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div className="w-full h-full border border-t-0 border-border overflow-hidden bg-background">
      {/* Canvas */}
      <div
        className="relative w-full border-none select-none h-full bg-transparent cursor-pointer overflow-hidden focus-visible:outline-none"
        onClick={jump}
        onTouchStart={(e) => {
          e.preventDefault();
          jump();
        }}
        role="button"
        tabIndex={0}
        aria-label="Dino game — press space or click to play"
        onKeyDown={(e) => {
          if (e.code === "Space") jump();
        }}
      >
        {/* Score */}
        <div className="w-full max-w-[800px] absolute top-0 right-0 z-10 py-2 px-4 flex justify-end">
          <span className="text-sm tabular-nums text-[var(--foreground)]">
            {String(displayScore).padStart(5, "0")}
          </span>
        </div>

        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="h-auto w-full border-none select-none"
          style={{
            border: "none",
            display: "block",
            imageRendering: "pixelated",
          }}
        />
      </div>

      {/* Hidden state indicators for a11y */}
      {isGameOver && (
        <span className="sr-only z-10">
          Game over. Score: {displayScore}. Press space to restart.
        </span>
      )}
      {!isStarted && (
        <span className="sr-only">
          Press space or tap to start the dino game.
        </span>
      )}
    </div>
  );
}
