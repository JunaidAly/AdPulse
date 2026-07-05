import { BarChart3, CreditCard, Globe, LayoutDashboard, LineChart } from "lucide-react";

const NAV = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: BarChart3, label: "Reports" },
  { icon: LineChart, label: "Analytics" },
  { icon: Globe, label: "Sites" },
  { icon: CreditCard, label: "Payments" },
];

const STATS = [
  { label: "Revenue", value: "$2,379.99", bar: "from-emerald-400 to-emerald-500" },
  { label: "Impressions", value: "491.0K", bar: "from-sky-400 to-sky-500" },
  { label: "eCPM", value: "$4.85", bar: "from-violet-400 to-violet-500" },
  { label: "Viewability", value: "74.8%", bar: "from-amber-400 to-amber-500" },
];

export function DashboardPreview() {
  return (
    <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl">
      {/* browser chrome */}
      <div className="flex items-center gap-2 border-b bg-[#f3f3f5] px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        <div className="mx-auto h-6 w-1/2 rounded-md bg-white/70" />
      </div>

      <div className="flex">
        {/* sidebar */}
        <aside className="hidden w-52 shrink-0 border-r p-4 sm:block">
          <p className="px-2 text-lg font-extrabold tracking-tight">
            Ad<span className="text-primary">Pulse</span>
          </p>
          <nav className="mt-5 space-y-1">
            {NAV.map(({ icon: Icon, label, active }) => (
              <div
                key={label}
                className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm ${
                  active ? "bg-accent font-medium text-accent-foreground" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-4 w-4" /> {label}
              </div>
            ))}
          </nav>
        </aside>

        {/* content */}
        <div className="flex-1 space-y-4 p-4 sm:p-6">
          <div className="rounded-xl border p-4">
            <p className="text-lg font-bold">Dashboard</p>
            <p className="text-xs text-muted-foreground">Performance, inventory, and demand signals.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="relative overflow-hidden rounded-xl border p-3">
                <span className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${s.bar}`} />
                <p className="text-[11px] text-muted-foreground">{s.label}</p>
                <p className="mt-1 text-lg font-bold">{s.value}</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl border p-4">
            <p className="text-sm font-semibold">Performance trend</p>
            <svg viewBox="0 0 600 180" className="mt-3 h-40 w-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="preview-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(152 60% 45%)" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="hsl(152 60% 45%)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0,120 C80,110 120,70 200,80 C280,90 320,60 400,55 C480,50 540,35 600,30 L600,180 L0,180 Z"
                fill="url(#preview-fill)"
              />
              <path
                d="M0,120 C80,110 120,70 200,80 C280,90 320,60 400,55 C480,50 540,35 600,30"
                fill="none"
                stroke="hsl(152 60% 40%)"
                strokeWidth="2.5"
              />
              <path
                d="M0,125 C80,116 120,78 200,86 C280,96 320,66 400,60 C480,54 540,40 600,36"
                fill="none"
                stroke="hsl(243 75% 59%)"
                strokeWidth="2.5"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
