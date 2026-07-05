import { Link } from "react-router-dom";

const COLUMNS = [
  { title: "Platform", accent: "#4b34e0", links: ["Products", "Kaz", "Changelog"] },
  { title: "Company", accent: "#2dd4bf", links: ["About", "Careers", "Contact"] },
  { title: "Legal", accent: "#f59e0b", links: ["Privacy", "Terms"] },
];

export function LandingFooter() {
  return (
    <footer className="relative overflow-hidden border-t bg-[#f7f4ec] pt-16">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-20 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <Link to="/" className="text-xl font-extrabold tracking-tight text-[#171331]">
            Ad<span className="text-primary">Pulse</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm text-[#6b6780]">
            Programmatic monetization tools and managed services for digital publishers.
          </p>
          <p className="mt-6 text-xs text-muted-foreground">© 2026 AdPulse. All rights reserved.</p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#413c55]">
              <span className="h-px w-4" style={{ background: col.accent }} /> {col.title}
            </p>
            <ul className="mt-4 space-y-3 text-sm text-[#5b5670]">
              {col.links.map((l) => (
                <li key={l}>
                  <a href="#" className="hover:text-primary">{l}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* perspective grid horizon */}
      <div className="relative h-40 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-32 w-32 -translate-x-1/2 rounded-full bg-amber-300/40 blur-3xl" />
        <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-40 w-full">
          {Array.from({ length: 21 }).map((_, i) => (
            <line key={`v${i}`} x1={i * 5} y1="40" x2={50} y2="0" stroke="#7c6cf5" strokeWidth="0.15" opacity="0.5" />
          ))}
          {Array.from({ length: 8 }).map((_, i) => {
            const y = 40 - i * (40 / 8);
            return <line key={`h${i}`} x1="0" y1={y} x2="100" y2={y} stroke="#7c6cf5" strokeWidth="0.15" opacity={0.5 - i * 0.05} />;
          })}
        </svg>
      </div>
    </footer>
  );
}
