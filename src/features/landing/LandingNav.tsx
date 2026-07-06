import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function LandingNav() {
  return (
    <header className="sticky top-0 z-50 mx-auto w-full max-w-6xl px-4 py-4">
      <nav className="flex items-center justify-between gap-4 rounded-full border border-black/5 bg-white/70 px-4 py-2.5 shadow-sm backdrop-blur-md sm:px-6">
        <Link to="/" className="text-xl font-extrabold tracking-tight text-[#1a1730]">
          Ad<span className="text-primary">Pulse</span>
        </Link>
        <div className="hidden items-center gap-8 text-sm font-medium text-[#413c55] md:flex">
          <a href="#features" className="hover:text-primary">Products</a>
          <a href="#growth" className="hover:text-primary">About</a>
          <a href="#faq" className="hover:text-primary">Contact</a>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/login" className="hidden text-sm font-medium text-[#413c55] hover:text-primary sm:block">
            Sign in
          </Link>
          <Button asChild className="rounded-full bg-[#1a1730] px-5 hover:bg-[#2a2545]">
            <Link to="/register">Start with AdPulse</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}
