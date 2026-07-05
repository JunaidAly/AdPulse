import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function ClosingSection() {
  return (
    <section className="relative overflow-hidden py-28">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-100/50 via-transparent to-amber-100/40" />
      <div className="relative mx-auto max-w-2xl px-4 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">— The summit —</p>
        <h2 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight text-[#171331] sm:text-6xl">
          Set the goal. We'll do the climbing.
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg text-[#5b5670]">
          One tag today, and the loop starts working your inventory toward the number that matters — while your
          team gets their mornings back.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg" className="rounded-full px-8 text-base">
            <Link to="/register">Start with AdPulse</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full border-black/10 bg-white px-8 text-base">
            <Link to="/login">Talk to us</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
