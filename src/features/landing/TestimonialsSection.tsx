import { Quote } from "lucide-react";

const TESTIMONIALS = [
  {
    tag: "the bet",
    quote:
      "I'm not predicting what AdPulse can ship anymore, because I think they can give this market anything. The conventional wisdom says you win by narrowing — to one category, one market, one kind of customer. AdPulse is my bet against these constraints. The old trade-off between serving everyone and serving them well? I think they made it stop being true.",
    name: "Robert Dub",
    role: "Board member",
  },
  {
    tag: "the payoff",
    quote:
      "An effective solution for our web monetization needs. We've seen a significant increase in revenue and the platform is easy to use and integrate. The team is responsive and helpful, and the platform is constantly improving. The rules are an interesting thing to get used to, because they are seriously not like other ad tech solutions. We're excited to see where it goes next.",
    name: "Marc Oliver",
    role: "Independent publisher",
  },
];

export function TestimonialsSection() {
  return (
    <section className="bg-[#eef0fb] py-24">
      <div className="mx-auto max-w-6xl px-4 text-center">
        <h2 className="text-4xl font-extrabold tracking-tight text-[#171331] sm:text-5xl">Backed, and proven</h2>
        <p className="mx-auto mt-4 max-w-2xl text-[#5b5670]">
          People choose AdPulse because it makes publisher monetization easier to understand, run, and improve.
        </p>
        <div className="mt-14 grid gap-8 md:grid-cols-2">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="relative rounded-2xl border-2 border-primary/40 bg-white/60 p-7 text-left">
              <span className="absolute -top-8 right-6 font-[cursive] text-lg text-primary">{t.tag}</span>
              <Quote className="h-6 w-6 text-primary/40" />
              <p className="mt-3 leading-relaxed text-[#2a2740]">{t.quote}</p>
              <p className="mt-5 text-sm font-semibold text-[#171331]">
                {t.name} <span className="font-normal text-muted-foreground">· {t.role}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
