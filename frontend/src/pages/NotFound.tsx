import { Link } from "react-router-dom";
import { Shield, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 hero-glow" />

      <div className="relative text-center max-w-md">
        {/* Big 404 */}
        <div className="relative mb-6">
          <p className="text-[120px] sm:text-[160px] font-black text-foreground/[0.03] leading-none select-none">404</p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
              <Shield size={28} className="text-primary" strokeWidth={2} />
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2">Page not found</h1>
        <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
          <br />But your files are still safe — they never left your computer.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-2 h-10 px-5 rounded-xl bg-primary text-primary-foreground text-[14px] font-semibold hover:bg-primary/90 transition-all shadow-md shadow-primary/30"
          >
            <Home size={14} /> Go Home
          </Link>
          <button
            onClick={() => {
              const event = new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true });
              window.dispatchEvent(event);
            }}
            className="flex items-center gap-2 h-10 px-5 rounded-xl border border-border/50 bg-secondary/30 text-[14px] font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all"
          >
            <Search size={14} /> Search Tools
          </button>
        </div>

        <p className="mt-10 text-[11px] text-muted-foreground/30">
          PrivaTools • 90+ privacy-first file tools
        </p>
      </div>
    </div>
  );
}
