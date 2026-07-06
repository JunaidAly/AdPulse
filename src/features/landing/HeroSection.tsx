import { Link } from "react-router-dom";
import { Boxes, MousePointerClick, Sparkles, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardPreview } from "./DashboardPreview";
import { Reveal, Stagger, StaggerItem } from "./motion";

const BULLETS = [
  { icon: Boxes, title: "Rules engine", desc: "Configure ads as logical steps." },
  { icon: MousePointerClick, title: "Managed placements", desc: "No need for extra code." },
  { icon: Sparkles, title: "Kaz, your agent", desc: "Reports, edits, advice — on ask." },
  { icon: Globe, title: "Open to publishers", desc: "Built for every stage of growth." },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* decorative glow */}
      <div className="pointer-events-none absolute -right-40 top-0 h-[520px] w-[520px] rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute -left-40 top-40 h-[420px] w-[420px] rounded-full bg-violet-300/20 blur-3xl" />

      <div className="relative mx-auto max-w-5xl px-4 pt-20 text-center sm:pt-28">
        <Reveal>
          <h1 className="text-5xl font-extrabold leading-[1.05] tracking-tight text-[#171331] sm:text-6xl md:text-7xl">
            Autopilot for <span className="text-primary">publisher monetization.</span>
          </h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-[#5b5670]">
            Grow ad revenue with AI-assisted rules, reporting, experiments, and ad ops support built for
            publishers.
          </p>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="rounded-full px-8 text-base">
              <Link to="/register">Start with AdPulse</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full border-black/10 bg-white px-8 text-base">
              <a href="#features">Take the tour</a>
            </Button>
          </div>
        </Reveal>

        <Stagger className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-6 text-left md:grid-cols-4">
          {BULLETS.map(({ icon: Icon, title, desc }) => (
            <StaggerItem key={title}>
              <Icon className="h-5 w-5 text-primary" />
              <p className="mt-3 font-semibold text-[#171331]">{title}</p>
              <p className="mt-1 text-sm text-[#6b6780]">{desc}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>

      <Reveal delay={0.15} y={40} className="relative mx-auto mt-16 max-w-6xl px-4">
        <DashboardPreview />
      </Reveal>
    </section>
  );
}
