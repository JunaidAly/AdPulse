import { Feather, HeartHandshake, Link2, LineChart, Shapes } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "./motion";

interface Milestone {
  icon: LucideIcon;
  title: string;
  desc: string;
  color: string; // border/text color
  x: number; // % along curve
  y: number; // % height (0 top)
}

const MILESTONES: Milestone[] = [
  { icon: Shapes, title: "Formats that perform", desc: "From battle-tested responsive display to rewarded, focused, and interstitial — the full modern toolkit.", color: "#38bdf8", x: 12, y: 74 },
  { icon: HeartHandshake, title: "Ad ops on your side", desc: "Revshare and real care align us with you. People who optimize because your revenue is our revenue.", color: "#10b981", x: 31, y: 58 },
  { icon: Feather, title: "Featherweight tech", desc: "Every ad serves through a single non-blocking script — a fraction of the size of typical ad tags.", color: "#f59e0b", x: 50, y: 44 },
  { icon: LineChart, title: "Reporting you'll use", desc: "Clear dashboards, easy exports, an API and MCP, Kaz built in, plus privacy-respecting page analytics.", color: "#ef4444", x: 69, y: 28 },
  { icon: Link2, title: "Shares that reward you", desc: "Automation and established positioning let us pay revenue shares above the standard rates.", color: "#7c6cf5", x: 88, y: 12 },
];

export function GrowthSection() {
  return (
    <section id="growth" className="mx-auto max-w-6xl px-4 py-24">
      <Reveal className="text-center">
        <p className="text-sm font-semibold text-primary">What we give publishers</p>
        <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-[#171331] sm:text-5xl">
          Built around your growth
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-[#5b5670]">
          Each step of the climb does something useful for your bottom line — here is what you can count on.
        </p>
      </Reveal>

      <div className="relative mt-16 hidden h-64 md:block">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
          <line x1="0" y1="82" x2="100" y2="82" stroke="#e5e2d8" strokeWidth="0.3" />
          <line x1="0" y1="64" x2="100" y2="20" stroke="#c9c2f5" strokeWidth="0.3" strokeDasharray="1 1" />
          <path d="M0,84 L100,4" stroke="#4b34e0" strokeWidth="0.6" fill="none" />
        </svg>
        {MILESTONES.map(({ icon: Icon, title, color, x, y }) => (
          <div key={title} className="absolute -translate-x-1/2" style={{ left: `${x}%`, top: `${y}%` }}>
            <span className="absolute left-1/2 top-1/2 h-24 w-px -translate-x-1/2 border-l border-dashed" style={{ borderColor: color, opacity: 0.4 }} />
            <div className="relative flex h-12 w-12 items-center justify-center rounded-full border-2 bg-white shadow-sm" style={{ borderColor: color }}>
              <Icon className="h-5 w-5" style={{ color }} />
            </div>
          </div>
        ))}
      </div>

      <Stagger className="mt-8 grid gap-8 sm:grid-cols-2 md:mt-12 md:grid-cols-5">
        {MILESTONES.map(({ title, desc }) => (
          <StaggerItem key={title} className="text-center md:text-left">
            <h3 className="font-semibold text-[#171331]">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#6b6780]">{desc}</p>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
