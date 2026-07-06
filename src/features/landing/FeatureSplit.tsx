import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal } from "./motion";

interface FeatureSplitProps {
  icon: LucideIcon;
  eyebrow: string;
  eyebrowColor?: string;
  title: ReactNode;
  desc: string;
  note?: string;
  noteColor?: string;
  mockup: ReactNode;
  reverse?: boolean;
}

export function FeatureSplit({
  icon: Icon,
  eyebrow,
  eyebrowColor = "#4b34e0",
  title,
  desc,
  note,
  noteColor = "#4b34e0",
  mockup,
  reverse,
}: FeatureSplitProps) {
  return (
    <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:gap-16">
      <Reveal className={cn(reverse && "md:order-2")}>
        <div className="flex items-center gap-2">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full border"
            style={{ borderColor: `${eyebrowColor}55`, color: eyebrowColor }}
          >
            <Icon className="h-4 w-4" />
          </span>
          <span className="text-sm font-semibold" style={{ color: eyebrowColor }}>
            {eyebrow}
          </span>
        </div>
        <h3 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-[#171331] sm:text-4xl">
          {title}
        </h3>
        <p className="mt-4 text-[#5b5670]">{desc}</p>
        {note && (
          <p className="mt-6 border-l-2 pl-3 text-sm font-medium italic" style={{ borderColor: noteColor, color: noteColor }}>
            {note}
          </p>
        )}
      </Reveal>
      <Reveal delay={0.1} y={40} className={cn(reverse && "md:order-1")}>
        {mockup}
      </Reveal>
    </div>
  );
}
