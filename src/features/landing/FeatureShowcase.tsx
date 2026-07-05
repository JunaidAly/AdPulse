import { Boxes, Feather, Sparkles } from "lucide-react";
import { FeatureSplit } from "./FeatureSplit";

function BrowserFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-black/10 bg-white shadow-xl">
      <div className="flex items-center gap-1.5 border-b bg-[#f3f3f5] px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
      </div>
      <div className="p-4 text-xs">{children}</div>
    </div>
  );
}

function RulesMockup() {
  const conds = [
    ["Country", "is", "United States"],
    ["Device", "is", "Mobile"],
    ["Page type", "is", "Article"],
  ];
  const changes = ["Lazy-load ads", "Ad refresh interval", "Footer anchor ad"];
  return (
    <BrowserFrame>
      <p className="font-semibold">Boost mobile US viewability</p>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border p-3">
          <p className="mb-2 font-medium text-muted-foreground">When does this rule apply?</p>
          {conds.map(([a, b, c], i) => (
            <div key={i} className="mt-1.5 flex items-center gap-1.5">
              <span className="rounded border bg-muted px-1.5 py-1">{a}</span>
              <span className="text-muted-foreground">{b}</span>
              <span className="rounded border bg-muted px-1.5 py-1">{c}</span>
            </div>
          ))}
        </div>
        <div className="rounded-lg border p-3">
          <p className="mb-2 font-medium text-muted-foreground">What should change?</p>
          {changes.map((c) => (
            <div key={c} className="mt-1.5 flex items-center justify-between rounded border px-2 py-1.5">
              <span>{c}</span>
              <span className="rounded bg-amber-100 px-1 text-[10px] font-semibold text-amber-700">MODIFIED</span>
            </div>
          ))}
        </div>
      </div>
    </BrowserFrame>
  );
}

function KazMockup() {
  const steps = ["Looked up site references", "Inspected page context", "Checked ad spacing", "Proposed placement"];
  return (
    <BrowserFrame>
      <div className="rounded-lg bg-muted/50 p-2">
        <p className="font-semibold">Ad placement on article pages</p>
      </div>
      <div className="mt-3 ml-auto w-4/5 rounded-lg bg-primary/10 p-2 text-right text-primary">
        Can you add an ad below the headline, but keep it from crowding the first paragraph?
      </div>
      <div className="mt-3 flex items-center gap-1.5 font-medium text-primary">
        <Sparkles className="h-3.5 w-3.5" /> Worked through 4 steps
      </div>
      {steps.map((s) => (
        <p key={s} className="mt-1.5 flex items-center gap-1.5 text-muted-foreground">
          <span className="text-emerald-500">✓</span> {s}
        </p>
      ))}
      <p className="mt-3 rounded-lg border p-2 leading-relaxed">
        There's a clean spot under the headline, above the first paragraph — no ad nearby. I've drafted an{" "}
        <span className="font-semibold">in-content placement</span> for review.
      </p>
    </BrowserFrame>
  );
}

function TagsMockup() {
  const tags = [
    ["In-content · below headline", "Native"],
    ["Sidebar · sticky", "Display"],
    ["Footer anchor", "Anchor"],
  ];
  return (
    <BrowserFrame>
      <p className="font-semibold">Ad tags</p>
      <p className="text-muted-foreground">Embed once, then place each tag on your pages.</p>
      <div className="mt-3 rounded-lg bg-[#111827] p-3 font-mono text-[11px] text-emerald-300">
        &lt;script async src="https://cdn.adpulse.ai/s/ab12cd.js"&gt;&lt;/script&gt;
      </div>
      <div className="mt-3 space-y-1.5">
        {tags.map(([name, kind]) => (
          <div key={name} className="flex items-center justify-between rounded-lg border px-2 py-1.5">
            <span>{name}</span>
            <span className="flex items-center gap-1">
              <span className="rounded bg-emerald-100 px-1 text-[10px] font-semibold text-emerald-700">Active</span>
              <span className="rounded bg-muted px-1 text-[10px] font-medium text-muted-foreground">{kind}</span>
            </span>
          </div>
        ))}
      </div>
    </BrowserFrame>
  );
}

export function FeatureShowcase() {
  return (
    <section
      id="features"
      className="relative"
      style={{ backgroundImage: "radial-gradient(#d9d4f0 0.8px, transparent 0.8px)", backgroundSize: "22px 22px" }}
    >
      <FeatureSplit
        icon={Boxes}
        eyebrow="Rules engine"
        title={<>Configure ads <span className="text-primary">like you'd describe them</span> — stack conditions, decide what loads, set how it refreshes.</>}
        desc="Composed as logical steps your team can read, audit, and version. No more hidden ad ops in spreadsheets, no more waiting on a developer to ship a tweak."
        note="Really readable."
        mockup={<RulesMockup />}
      />
      <FeatureSplit
        icon={Sparkles}
        eyebrow="Meet Kaz"
        eyebrowColor="#10b981"
        title={<>Ask in plain language. Kaz <span className="text-primary">runs the report, drafts the rule,</span> and tells you what's moving.</>}
        desc="Kaz uses the same reporting, rules, and site context your team uses. Ask a question, review the answer or proposed change, and keep moving without opening extra tools."
        note="Really useful."
        noteColor="#10b981"
        mockup={<KazMockup />}
        reverse
      />
      <FeatureSplit
        icon={Feather}
        eyebrow="Featherweight tech"
        eyebrowColor="#f59e0b"
        title={<><span className="text-primary">One async tag</span> in the head. Every format runs from the same lightweight setup.</>}
        desc="Non-blocking and off your critical path, so ad delivery stays simple to install and maintain. New formats can be added without re-tagging your pages."
        note="Really light."
        noteColor="#f59e0b"
        mockup={<TagsMockup />}
      />
    </section>
  );
}
