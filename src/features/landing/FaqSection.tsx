import { useState } from "react";
import { Minus, Plus } from "lucide-react";

const FAQS = [
  {
    q: "How do I add AdPulse to my site?",
    a: "AdPulse starts with one async tag. You can add it manually or manage placements through the platform, without rebuilding your site or replacing everything at once.",
  },
  {
    q: "What's the revenue share?",
    a: "Publishers keep the majority share, and automation plus established demand relationships let us pay revenue shares above standard rates. Your exact share is shown in your account.",
  },
  {
    q: "How soon will I see results?",
    a: "Most publishers see measurable movement within the first few weeks as rules tune to your traffic, with a median RPM lift in the first 90 days.",
  },
  {
    q: "When and how do I get paid?",
    a: "Payouts are processed once your balance exceeds the $50 minimum, via USDT or bank transfer — whichever you configure in Payments.",
  },
  {
    q: "Who runs it?",
    a: "You set the goals and approve changes; AdPulse and Kaz handle the recurring optimization, with every decision visible and reviewable.",
  },
];

export function FaqSection() {
  const [open, setOpen] = useState(0);
  return (
    <section
      id="faq"
      className="relative py-24"
      style={{ backgroundImage: "radial-gradient(#d9d4f0 0.8px, transparent 0.8px)", backgroundSize: "22px 22px" }}
    >
      <div className="mx-auto max-w-3xl px-4">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">— Questions —</p>
          <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-[#171331] sm:text-5xl">
            The things publishers ask first
          </h2>
        </div>
        <div className="mt-12 space-y-2">
          {FAQS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q} className="border-b border-dashed border-primary/20">
                <button
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                >
                  <span className="text-lg font-semibold text-[#171331]">{item.q}</span>
                  {isOpen ? (
                    <Minus className="h-5 w-5 shrink-0 text-primary" />
                  ) : (
                    <Plus className="h-5 w-5 shrink-0 text-primary" />
                  )}
                </button>
                {isOpen && <p className="pb-6 pr-8 text-[#5b5670]">{item.a}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
