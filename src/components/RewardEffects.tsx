import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { type RewardDetail } from "@/lib/rewards";

type Particle = {
  x: number; y: number; vx: number; vy: number; z: number; vz: number;
  spin: number; spinSpeed: number; tilt: number; size: number; color: string;
  shape: "ribbon" | "foil" | "spark"; life: number;
};
type Flash = { id: number; x: number; y: number; kind: RewardDetail["kind"] };

/** A transient, fixed canvas: layered foil, curved ribbons and perspective-scaled particles. */
export function RewardEffects() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const frameRef = useRef<number>(0);
  const lastRef = useRef<number>(0);
  const [flash, setFlash] = useState<Flash | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const palette = () => {
      const css = getComputedStyle(document.documentElement);
      return ["--primary", "--hud-accent", "--warning", "--chart-2", "--card"].map((token) => css.getPropertyValue(token).trim());
    };
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = (now: number) => {
      const dt = Math.min((now - (lastRef.current || now)) / 16.67, 2);
      lastRef.current = now;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      particlesRef.current = particlesRef.current.filter((p) => p.life > 0 && p.y < window.innerHeight + 40);
      for (const p of particlesRef.current) {
        p.vx *= Math.pow(0.992, dt);
        p.vy += 0.15 * dt;
        p.x += p.vx * dt + Math.sin(now / 300 + p.tilt) * 0.32 * dt;
        p.y += p.vy * dt;
        p.z += p.vz * dt;
        p.vz *= Math.pow(0.96, dt);
        p.spin += p.spinSpeed * dt;
        p.life -= dt;
        const perspective = Math.max(0.55, Math.min(1.7, 1 + p.z / 220));
        const fade = Math.min(1, p.life / 22);
        const turn = Math.cos(p.spin);
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.tilt + Math.sin(p.spin) * 0.3);
        ctx.globalAlpha = fade * (0.68 + Math.abs(turn) * 0.32);
        ctx.fillStyle = p.color;
        if (p.shape === "spark") {
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size * perspective * 0.42, p.size * perspective * 0.42, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === "ribbon") {
          ctx.strokeStyle = p.color;
          ctx.lineWidth = Math.max(0.7, Math.abs(turn) * 2.5 * perspective);
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(-p.size * perspective, -p.size * 0.5);
          ctx.quadraticCurveTo(0, p.size * (1.3 + Math.sin(p.spin)), p.size * perspective, p.size * 0.3);
          ctx.stroke();
        } else {
          ctx.fillRect(-p.size * perspective / 2, -p.size * 0.32 * perspective, Math.max(0.7, p.size * perspective * Math.abs(turn)), p.size * 0.62 * perspective);
        }
        ctx.restore();
      }
      if (particlesRef.current.length) frameRef.current = requestAnimationFrame(draw);
      else { frameRef.current = 0; lastRef.current = 0; }
    };

    const onReward = (event: Event) => {
      const { kind, x: requestedX, y: requestedY } = (event as CustomEvent<RewardDetail>).detail;
      const x = requestedX ?? window.innerWidth / 2;
      const y = requestedY ?? window.innerHeight * 0.38;
      if (flashTimer.current) clearTimeout(flashTimer.current);
      setFlash({ kind, x, y, id: Date.now() });
      flashTimer.current = setTimeout(() => setFlash(null), kind === "goal" ? 2100 : 1150);
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const colors = palette();
      const count = kind === "goal" ? 95 : kind === "trip" ? 58 : 36;
      for (let i = 0; i < count; i++) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * (kind === "goal" ? 2.8 : 2.2);
        const speed = 3 + Math.random() * (kind === "goal" ? 10 : 7);
        particlesRef.current.push({
          x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
          z: (Math.random() - 0.5) * 140, vz: (Math.random() - 0.5) * 4,
          spin: Math.random() * Math.PI * 2, spinSpeed: (Math.random() - 0.5) * 0.23,
          tilt: Math.random() * Math.PI * 2, size: 3 + Math.random() * 7,
          color: colors[Math.floor(Math.random() * colors.length)],
          shape: i % 7 === 0 ? "ribbon" : i % 5 === 0 ? "spark" : "foil",
          life: 58 + Math.random() * 65,
        });
      }
      if (!frameRef.current) frameRef.current = requestAnimationFrame(draw);
    };
    window.addEventListener("driver-reward", onReward);
    return () => {
      window.removeEventListener("driver-reward", onReward);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(frameRef.current);
      if (flashTimer.current) clearTimeout(flashTimer.current);
    };
  }, []);

  if (typeof document === "undefined") return null;
  return createPortal(<div className="reward-layer" aria-live="polite">
    <canvas ref={canvasRef} aria-hidden="true" />
    {flash && <div key={flash.id} className={`reward-flash reward-flash-${flash.kind}`} style={{ left: flash.x, top: flash.y }}>
      <span className="reward-halo" aria-hidden="true" />
      <span className="reward-ring" aria-hidden="true" />
      <span className="reward-message">{flash.kind === "goal" ? "היעד היומי הושג!" : flash.kind === "trip" ? "נסיעה הושלמה" : "ההכנסה נשמרה"}</span>
    </div>}
  </div>, document.body);
}
