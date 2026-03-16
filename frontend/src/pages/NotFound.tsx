import { Link } from "react-router-dom";
import { Shield, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 relative overflow-hidden">
      {/* Animated mesh orb backgrounds */}
      <div className="mesh-orb absolute top-[-20%] left-[-15%] w-[500px] h-[500px] opacity-25" />
      <div className="mesh-orb-2 absolute bottom-[-15%] right-[-10%] w-[450px] h-[450px] opacity-20" />
      <div className="mesh-orb-3 absolute top-[20%] right-[10%] w-[250px] h-[250px] opacity-15" />

      {/* Background glow */}
      <div className="absolute inset-0 hero-glow" />

      <div className="relative text-center max-w-md">
        {/* Big 404 */}
        <div className="relative mb-8">
          <p
            className="text-[140px] sm:text-[180px] font-black font-heading leading-none select-none text-gradient"
            style={{
              backgroundImage: "linear-gradient(135deg, hsl(158 64% 48%), hsl(168 60% 45%), hsl(178 55% 50%))",
            }}
          >
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 glow-primary">
              <Shield size={34} className="text-primary" strokeWidth={2} />
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-bold font-heading text-foreground mb-3">Page not found</h1>
        <p className="text-sm text-muted-foreground mb-10 leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
          <br />But your files are still safe — they never left your computer.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-2 h-11 px-6 rounded-xl bg-primary text-primary-foreground text-[14px] font-semibold glow-primary hover:bg-primary/90 transition-all"
          >
            <Home size={15} /> Go Home
          </Link>
          <button
            onClick={() => {
              const event = new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true });
              window.dispatchEvent(event);
            }}
            className="flex items-center gap-2 h-11 px-6 rounded-xl border border-border/50 bg-secondary/30 text-[14px] font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all"
          >
            <Search size={15} /> Search Tools
          </button>
        </div>

        <p className="mt-12 text-[11px] text-muted-foreground/30">
          PrivaTools • 90+ privacy-first file tools
        </p>
      </div>
    </div>
  );
}
