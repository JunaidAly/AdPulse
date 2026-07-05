import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function AutomateBanner() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-violet-200/60 via-indigo-100/40 to-transparent" />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, rgba(75,52,224,0.12) 0 2px, transparent 2px 7px)",
        }}
      />
      <div className="relative mx-auto max-w-3xl px-4 py-28 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">— What we're for —</p>
        <h2 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight text-[#171331] sm:text-5xl md:text-6xl">
          Automate what <span className="text-[#6b6780]">repeats.</span>
          <br />
          Improve what <span className="text-primary">matters.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg text-[#5b5670]">
          AdPulse automates the recurring parts of ad ops while keeping the important decisions visible,
          reviewable, and close to the publisher.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg" className="rounded-full px-8 text-base">
            <Link to="/register">Start with AdPulse</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full border-black/10 bg-white px-8 text-base">
            <a href="#features">See how it works</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
