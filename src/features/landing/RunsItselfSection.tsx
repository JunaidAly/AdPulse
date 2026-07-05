import { Gauge, Radio, Sparkles, Target } from "lucide-react";

export function RunsItselfSection() {
  return (
    <section className="relative overflow-hidden bg-[#1e1a4a] py-28 text-white">
      <div className="pointer-events-none absolute -left-20 top-10 h-96 w-96 rounded-full bg-indigo-500/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 bottom-0 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 md:grid-cols-2">
        <div>
          <h2 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            You set it up once. It runs itself.
          </h2>
          <p className="mt-5 max-w-md text-lg text-indigo-100/80">
            Paste a tag, name a goal — then AdPulse serves, measures, and keeps tuning toward that number.
          </p>
          <div className="mt-8 max-w-md rounded-2xl border border-white/15 bg-white/5 p-5">
            <p className="flex items-center gap-2 text-sm text-indigo-200">
              <span className="h-2 w-2 rounded-full bg-violet-400" /> On you, once
            </p>
            <p className="mt-3 font-semibold">Paste one tag</p>
            <p className="mt-1 text-sm text-indigo-100/70">
              One async line in your site's &lt;head&gt; — that's the whole integration.
            </p>
            <div className="mt-4 border-t border-white/10 pt-3 text-sm text-indigo-200/80">
              ≈ 2 minutes to go live.
            </div>
          </div>
        </div>

        <div className="relative mx-auto h-80 w-80">
          <div className="absolute inset-0 rounded-full border border-white/15" />
          <OrbitNode className="left-1/2 top-0 -translate-x-1/2 -translate-y-1/2" icon={Radio} label="Serve" sub="every format, one tag" />
          <OrbitNode className="right-0 bottom-10 translate-x-1/4" icon={Gauge} label="Measure" sub="viewability · fill · RPM" color="#2dd4bf" />
          <OrbitNode className="left-0 bottom-10 -translate-x-1/4" icon={Sparkles} label="Optimize" sub="rules tuned as data changes" color="#fbbf24" />
          <div className="absolute left-1/2 top-1/2 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-white text-center text-[#1e1a4a] shadow-xl">
            <Target className="h-4 w-4 text-primary" />
            <p className="mt-1 text-[10px] text-muted-foreground">Your goal</p>
            <p className="text-sm font-bold">Session RPM</p>
            <p className="text-xs font-semibold text-primary">↑ grow</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function OrbitNode({
  className,
  icon: Icon,
  label,
  sub,
  color = "#a78bfa",
}: {
  className: string;
  icon: typeof Radio;
  label: string;
  sub: string;
  color?: string;
}) {
  return (
    <div className={`absolute flex flex-col items-center text-center ${className}`}>
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg" style={{ boxShadow: `0 0 24px -4px ${color}` }}>
        <Icon className="h-6 w-6" style={{ color }} />
      </div>
      <p className="mt-2 text-sm font-semibold">{label}</p>
      <p className="max-w-[8rem] text-[11px] text-indigo-100/70">{sub}</p>
    </div>
  );
}
