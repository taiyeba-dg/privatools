import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Shield, Github, ArrowRight, Zap, Globe, Lock,
  Code2, Heart, Star, Users, CheckCircle2, ChevronRight,
} from "lucide-react";
import { tools, categoryMeta } from "@/data/tools";
import { cn } from "@/lib/utils";

const featuredTools = ["merge-pdf", "split-pdf", "compress-pdf", "ocr-pdf", "edit-pdf", "sign-pdf"];

const features = [
  {
    icon: Lock,
    title: "100% Private",
    description: "All processing happens locally on your own server. Your files never leave your infrastructure.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "No waiting for uploads. Local processing means your files are ready in seconds.",
  },
  {
    icon: Globe,
    title: "Works Everywhere",
    description: "Any browser, any device, any OS. No installs, no plugins, no extensions required.",
  },
  {
    icon: Code2,
    title: "Open Source",
    description: "Every line of code is public. Audit it, fork it, self-host it, contribute to it.",
  },
  {
    icon: Heart,
    title: "Completely Free",
    description: "No freemium, no paywalls, no sign-ups. Every tool is free for everyone, forever.",
  },
  {
    icon: Shield,
    title: "No Tracking",
    description: "We don't collect data, set cookies, or track anything. Your privacy is absolute.",
  },
];

const testimonials = [
  {
    quote: "Finally a PDF tool that doesn't make me create an account just to merge two files. Works perfectly.",
    author: "Alex R.",
    role: "Freelance Designer",
    stars: 5,
  },
  {
    quote: "I use the OCR tool every day at work. Fast, accurate, and completely free — can't ask for more.",
    author: "Sarah K.",
    role: "Legal Assistant",
    stars: 5,
  },
  {
    quote: "The open source aspect won me over. I actually reviewed the code and it does exactly what it says.",
    author: "Marcus T.",
    role: "Software Engineer",
    stars: 5,
  },
];

export default function LandingPage() {
  const featured = featuredTools.map(s => tools.find(t => t.slug === s)!).filter(Boolean);

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-50 rounded-xl border border-border/50 bg-secondary/25 backdrop-blur-xl mx-2 sm:mx-4 mt-2">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-14 items-center gap-4">
            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/25">
                <Shield size={14} className="text-primary-foreground" strokeWidth={2.25} />
              </div>
              <span className="text-sm font-bold font-heading text-foreground">PrivaTools</span>
            </Link>
            <div className="flex-1" />
            <nav className="hidden md:flex items-center gap-0.5">
              {[{ label: "All Tools", href: "/" }, { label: "About", href: "/about" }].map(n => (
                <Link key={n.label} to={n.href} className="px-3 py-1.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors">
                  {n.label}
                </Link>
              ))}
            </nav>
            <a
              href="https://github.com/taiyeba-dg/privatools"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-xl border border-border/50 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github size={13} />
              <span className="hidden sm:inline">GitHub</span>
            </a>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden hero-glow">
          {/* Mesh orb animated backgrounds */}
          <div className="mesh-orb absolute top-[-20%] left-[-10%] w-[600px] h-[600px] opacity-30" />
          <div className="mesh-orb-2 absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] opacity-20" />
          <div className="mesh-orb-3 absolute top-[30%] right-[15%] w-[300px] h-[300px] opacity-15" />

          <div className="grid-bg pointer-events-none absolute inset-0 opacity-[0.04]" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-24 pb-20 sm:pt-32 sm:pb-24 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1 text-xs font-medium text-primary mb-8">
              <Github size={11} />
              Open source · Free · No sign-up
            </div>
            <h1 className="mx-auto max-w-4xl text-5xl sm:text-6xl lg:text-7xl font-extrabold font-heading tracking-tight leading-[1.08]">
              <span className="text-foreground">The PDF toolkit</span>
              <br />
              <span
                className="text-gradient"
                style={{
                  backgroundImage: "linear-gradient(135deg, hsl(158 64% 48%), hsl(168 60% 45%), hsl(178 55% 50%))",
                }}
              >
                built for everyone.
              </span>
            </h1>
            <p className="mx-auto mt-7 max-w-lg text-base sm:text-lg text-muted-foreground leading-relaxed">
              30+ powerful PDF tools. Completely free, open source, and privacy-first. No accounts. No limits. No catch.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button size="lg" className="h-12 px-8 text-sm font-semibold rounded-xl glow-primary" asChild>
                <Link to="/">Explore all tools <ArrowRight size={15} /></Link>
              </Button>
              <a
                href="https://github.com/taiyeba-dg/privatools"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center gap-2 rounded-xl border border-border/50 px-6 text-sm text-muted-foreground hover:text-foreground hover:border-border/60 transition-colors"
              >
                <Github size={15} />
                View on GitHub
              </a>
            </div>
            <div className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
              {[
                { icon: Users, label: "10M+ users" },
                { icon: Star, label: "4.9 / 5 rating" },
                { icon: Shield, label: "Zero data collected" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Icon size={13} className="text-primary/70" />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="border-t border-border/50" />

        {/* Featured Tools */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">Most Popular</p>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-foreground">Start with the tools everyone loves</h2>
            <p className="mt-2 text-sm text-muted-foreground">No sign-up needed. Just pick a tool and go.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {featured.map(tool => {
              const m = categoryMeta[tool.category];
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.slug}
                  to={`/tool/${tool.slug}`}
                  className="tool-card group flex flex-col gap-3.5 rounded-xl border border-border/50 bg-card p-5 transition-all duration-200 hover:-translate-y-0.5"
                >
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", m.iconBg)}>
                    <Icon size={19} strokeWidth={1.75} className={m.iconColor} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{tool.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{tool.description}</p>
                  </div>
                  <div className="mt-auto flex items-center gap-1 text-xs text-primary font-medium">
                    Use tool <ChevronRight size={12} />
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="text-center mt-8">
            <Button variant="outline" asChild className="rounded-xl border-border/50 text-muted-foreground hover:text-foreground">
              <Link to="/">View all 30+ tools <ArrowRight size={14} /></Link>
            </Button>
          </div>
        </section>

        <div className="border-t border-border/50" />

        {/* Features */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">Why PrivaTools</p>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-foreground">Built different, by design</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map(f => {
              const FIcon = f.icon;
              return (
                <div key={f.title} className="rounded-xl border border-border/50 bg-card p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 mb-4">
                    <FIcon size={20} strokeWidth={1.75} className="text-primary" />
                  </div>
                  <h3 className="text-sm font-bold font-heading text-foreground mb-1.5">{f.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        <div className="border-t border-border/50" />

        {/* Testimonials */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">Testimonials</p>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-foreground">Loved by millions</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {testimonials.map(t => (
              <div key={t.author} className="rounded-xl border border-border/50 bg-card p-6 flex flex-col gap-4">
                <div className="flex gap-0.5">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">"{t.quote}"</p>
                <div className="pt-2 border-t border-border/30">
                  <p className="text-sm font-semibold text-foreground">{t.author}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="border-t border-border/50" />

        {/* Open source CTA */}
        <section className="relative overflow-hidden hero-glow">
          <div className="mesh-orb absolute top-[-30%] left-[20%] w-[400px] h-[400px] opacity-15" />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20 text-center relative">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 mb-6 mx-auto">
              <Github size={28} className="text-primary" strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-foreground mb-3">Open source and community-driven</h2>
            <p className="mx-auto max-w-md text-sm text-muted-foreground leading-relaxed mb-8">
              PrivaTools is built in the open. Star us on GitHub, report issues, suggest features, or submit a pull request.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="https://github.com/taiyeba-dg/privatools"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-8 text-sm font-semibold text-primary-foreground glow-primary transition-opacity hover:opacity-90"
              >
                <Github size={15} />
                Star on GitHub
              </a>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {[
                  { icon: CheckCircle2, label: "MIT License" },
                  { icon: CheckCircle2, label: "PRs welcome" },
                  { icon: CheckCircle2, label: "Self-hostable" },
                ].map(({ icon: I, label }) => (
                  <span key={label} className="flex items-center gap-1">
                    <I size={12} className="text-primary" />
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/25">
                  <Shield size={14} className="text-primary-foreground" />
                </div>
                <span className="font-bold font-heading text-foreground text-sm">PrivaTools</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Free, open source tools for privacy-conscious users.
              </p>
              <a href="https://github.com/taiyeba-dg/privatools" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <Github size={12} /> GitHub
              </a>
            </div>
            {[
              { heading: "Popular Tools", links: ["Merge PDF", "Split PDF", "Compress PDF", "Edit PDF"] },
              { heading: "More Tools", links: ["OCR PDF", "Sign PDF", "Protect PDF", "Word to PDF"] },
              { heading: "Project", links: ["About", "GitHub", "License", "Contributing"] },
            ].map(col => (
              <div key={col.heading}>
                <h4 className="text-xs font-semibold font-heading uppercase tracking-wider text-muted-foreground mb-3">{col.heading}</h4>
                <ul className="space-y-2">
                  {col.links.map(link => (
                    <li key={link}>
                      <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-8 border-t border-border/30 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <p>© 2025 PrivaTools · MIT License · Free forever</p>
            <p>No cookies · No tracking · No sign-up</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
