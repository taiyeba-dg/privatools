import { Link } from "react-router-dom";
import { Shield, Server, Trash2, Eye, Lock, Github, Globe, Code, Heart, EyeOff, Zap, Users } from "lucide-react";
import { EditorialMasthead } from "@/components/EditorialMasthead";
import { EditorialFooter } from "@/components/EditorialFooter";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <EditorialMasthead />

      <main className="max-w-4xl mx-auto px-4 py-12 space-y-16">
        {/* Hero */}
        <header className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--accent-primary)]/30 text-xs font-mono uppercase tracking-widest text-[var(--accent-primary)]">
            <Shield className="w-3.5 h-3.5" /> Privacy Manifesto
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight">
            Your files are <em>yours</em>.
          </h1>
          <p className="font-serif text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
            PrivaTools is built on a simple belief: you shouldn't have to trust a random website with your sensitive documents just to merge two PDFs.
          </p>
        </header>

        {/* Architecture */}
        <section className="space-y-8">
          <h2 className="font-serif text-2xl font-bold border-b-2 border-[var(--accent-primary)] pb-2 inline-block">
            How We Handle Your Files
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Server,
                title: "Process",
                desc: "Your file is sent to our server for processing. It exists in temporary memory only — never written to permanent storage.",
                color: "text-blue-500",
              },
              {
                icon: Trash2,
                title: "Delete Immediately",
                desc: "The moment processing finishes, your file is deleted from memory. We can't access it, recover it, or share it.",
                color: "text-red-500",
              },
              {
                icon: Eye,
                title: "Zero Knowledge",
                desc: "We never inspect, analyze, or read your file contents. Our servers process bytes — they don't understand what they contain.",
                color: "text-green-500",
              },
            ].map((item, i) => (
              <div key={i} className="p-6 border border-[var(--border-color)] rounded-lg space-y-3 hover:border-[var(--accent-primary)]/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--accent-primary)]/10 flex items-center justify-center">
                    <span className="font-mono text-sm font-bold text-[var(--accent-primary)]">{i + 1}</span>
                  </div>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <h3 className="font-serif text-lg font-bold">{item.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Client-side tools */}
        <section className="p-6 bg-[var(--accent-primary)]/5 border border-[var(--accent-primary)]/20 rounded-lg space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-[var(--accent-primary)]" />
            <h3 className="font-serif text-lg font-bold">Some tools never touch our servers</h3>
          </div>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            Tools like <strong>JSON Formatter</strong>, <strong>Text Diff</strong>, <strong>Base64</strong>, <strong>Hash Generator</strong>, and <strong>CSV↔JSON</strong> run
            100% in your browser using JavaScript. Your data never leaves your device — not even temporarily. Zero network requests.
          </p>
        </section>

        {/* What we DON'T do */}
        <section className="space-y-6">
          <h2 className="font-serif text-2xl font-bold border-b-2 border-[var(--accent-primary)] pb-2 inline-block">
            What We Don't Do
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: EyeOff, text: "We don't read your files" },
              { icon: Users, text: "We don't require accounts or emails" },
              { icon: Lock, text: "We don't store files after processing" },
              { icon: Eye, text: "We don't track you with cookies or analytics" },
              { icon: Globe, text: "We don't sell data — we have no data to sell" },
              { icon: Heart, text: "We don't have premium tiers or paywalls" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-md">
                <span className="mt-0.5 text-[var(--accent-primary)]">✗</span>
                <span className="text-sm text-[var(--text-secondary)]">{item.text}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Open Source */}
        <section className="space-y-6">
          <h2 className="font-serif text-2xl font-bold border-b-2 border-[var(--accent-primary)] pb-2 inline-block">
            Open Source
          </h2>
          <p className="font-serif text-base text-[var(--text-secondary)] leading-relaxed">
            PrivaTools is fully open source under the MIT license. Every line of code — frontend and backend — is publicly auditable.
            If you don't trust our servers, you can self-host the entire application with Docker.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://github.com/taiyeba-dg/privatools"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-md font-mono text-sm hover:opacity-90 transition-opacity"
            >
              <Github className="w-4 h-4" /> View on GitHub
            </a>
            <a
              href="https://github.com/taiyeba-dg/privatools"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 border border-[var(--border-color)] rounded-md font-mono text-sm hover:border-[var(--accent-primary)]/40 transition-colors"
            >
              <Code className="w-4 h-4" /> Self-Host with Docker
            </a>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8 border-y border-[var(--border-color)]">
          {[
            { value: "90+", label: "Free Tools" },
            { value: "0", label: "Files Stored" },
            { value: "0", label: "Accounts Required" },
            { value: "MIT", label: "License" },
          ].map((s, i) => (
            <div key={i} className="text-center space-y-1">
              <div className="font-serif text-3xl font-bold text-[var(--accent-primary)]">{s.value}</div>
              <div className="text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)]">{s.label}</div>
            </div>
          ))}
        </section>

        {/* CTA */}
        <section className="text-center space-y-4 py-8">
          <h2 className="font-serif text-2xl font-bold">Ready to try?</h2>
          <p className="text-sm text-[var(--text-secondary)]">No sign-up needed. Just pick a tool and go.</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--accent-primary)] text-white rounded-md font-mono text-sm hover:opacity-90 transition-opacity"
          >
            Browse All Tools →
          </Link>
        </section>
      </main>

      <EditorialFooter />
    </div>
  );
}
