import { Link } from "react-router-dom";
import { Github } from "lucide-react";

export function EditorialFooter() {
  return (
    <footer className="mt-16">
      <div className="rule-thick mx-4 sm:mx-6" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <p className="font-heading text-xl font-bold text-foreground tracking-wide uppercase">
              PrivaTools
            </p>
            <p className="font-serif-body text-sm text-muted-foreground mt-2 leading-relaxed">
              Free, open source tools for a more private internet. Every tool runs locally — your files never leave your infrastructure.
            </p>
            <a
              href="https://github.com/taiyeba-dg/privatools"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-3 font-mono-meta text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github size={12} /> GITHUB
            </a>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-sans-ui text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {["All Tools", "Batch Process", "Pipeline"].map(link => (
                <li key={link}>
                  <Link
                    to={link === "All Tools" ? "/" : `/${link.toLowerCase().replace(" ", "")}`}
                    className="font-serif-body text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contribute */}
          <div>
            <h4 className="font-sans-ui text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
              Contribute
            </h4>
            <p className="font-serif-body text-sm text-muted-foreground leading-relaxed">
              PrivaTools is MIT licensed. Star us on GitHub, report issues, or submit a pull request.
            </p>
          </div>
        </div>

        <div className="rule-thin mt-8 mb-6" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-mono-meta text-xs text-muted-foreground/60">
            © {new Date().getFullYear()} PRIVATOOLS · MIT LICENSE · FREE FOREVER
          </p>
          <p className="font-mono-meta text-xs text-muted-foreground/60">
            NO COOKIES · NO TRACKING · NO ACCOUNTS
          </p>
        </div>
      </div>
    </footer>
  );
}
