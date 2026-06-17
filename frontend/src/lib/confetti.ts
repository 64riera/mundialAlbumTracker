import confetti from "canvas-confetti";

const BRAND_COLORS = ["#22c55e", "#4ade80", "#16a34a", "#facc15", "#ffffff"];

export function confettiCollect() {
  confetti({
    particleCount: 25,
    spread: 50,
    startVelocity: 20,
    gravity: 0.8,
    ticks: 80,
    origin: { y: 0.7 },
    colors: BRAND_COLORS,
    scalar: 0.7,
    disableForReducedMotion: true,
  });
}

export function confettiBulk(count: number) {
  const intensity = Math.min(count, 10);
  const base = 15 + intensity * 8;

  confetti({
    particleCount: base,
    spread: 60 + intensity * 5,
    startVelocity: 25,
    gravity: 0.7,
    ticks: 120,
    origin: { x: 0.35, y: 0.6 },
    colors: BRAND_COLORS,
    scalar: 0.8,
    disableForReducedMotion: true,
  });

  setTimeout(() => {
    confetti({
      particleCount: Math.round(base * 0.6),
      spread: 50,
      startVelocity: 20,
      gravity: 0.7,
      ticks: 100,
      origin: { x: 0.65, y: 0.6 },
      colors: BRAND_COLORS,
      scalar: 0.8,
      disableForReducedMotion: true,
    });
  }, 150);
}
