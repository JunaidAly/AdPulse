import { Reveal, Stagger, StaggerItem } from "./motion";

export function StatsSection() {
  return (
    <section className="relative overflow-hidden bg-[#f2f0e8] py-24">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Ctext y='40' font-size='40' fill='%234b34e0'%3E%25%3C/text%3E%3C/svg%3E\")" }}
      />
      <div className="relative mx-auto max-w-5xl px-4 text-center">
        <Reveal>
          <h2 className="text-4xl font-extrabold tracking-tight text-[#171331] sm:text-5xl">
            What the automation adds up to
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[#5b5670]">
            The revenue outcome we work to move, the scale behind it, and the setup that keeps implementation simple.
          </p>
        </Reveal>

        <Stagger className="mt-16 flex flex-col items-center justify-center gap-8 md:flex-row md:gap-16">
          <StaggerItem className="flex h-64 w-64 flex-col items-center justify-center rounded-full border border-primary/30 bg-white shadow-[0_0_60px_-10px_rgba(75,52,224,0.35)]">
            <p className="text-6xl font-extrabold text-primary">+29%</p>
            <p className="mt-2 font-medium text-[#171331]">median RPM lift</p>
            <p className="text-sm text-muted-foreground">in the first 90 days</p>
          </StaggerItem>
          <div className="flex flex-col gap-6">
            <StaggerItem className="flex h-40 w-40 flex-col items-center justify-center rounded-full border border-emerald-300 bg-white shadow-lg">
              <p className="text-4xl font-extrabold text-emerald-500">300+</p>
              <p className="text-sm text-muted-foreground">registered publishers</p>
            </StaggerItem>
            <StaggerItem className="flex h-40 w-40 flex-col items-center justify-center rounded-full border border-amber-300 bg-white shadow-lg">
              <p className="text-4xl font-extrabold text-amber-500">$25M+</p>
              <p className="text-sm text-muted-foreground">earned by publishers</p>
            </StaggerItem>
          </div>
        </Stagger>
      </div>
    </section>
  );
}
