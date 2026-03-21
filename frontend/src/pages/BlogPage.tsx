import { Link } from "react-router-dom";
import { EditorialMasthead } from "@/components/EditorialMasthead";
import { EditorialFooter } from "@/components/EditorialFooter";
import { blogPosts } from "@/data/blog";
import { ArrowRight, Clock, Tag } from "lucide-react";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background">
      <EditorialMasthead />

      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-12">
        <header className="mb-10">
          <div className="section-flag mb-3">GUIDES & COMPARISONS</div>
          <h1 className="font-heading text-4xl font-black text-foreground leading-tight mb-3">
            PrivaTools Blog
          </h1>
          <p className="font-serif-body text-base text-muted-foreground max-w-xl">
            In-depth guides on PDF tools, privacy, and file processing — written to help you get more done without giving up your data.
          </p>
          <div className="rule-thin mt-6" />
        </header>

        <div className="space-y-0">
          {blogPosts.map((post, i) => (
            <article key={post.slug} className={`py-8 ${i < blogPosts.length - 1 ? "border-b border-border/40" : ""}`}>
              <div className="flex flex-wrap gap-2 mb-3">
                {post.tags.map((tag) => (
                  <span key={tag} className="category-tag text-xs">
                    <Tag size={9} className="inline mr-1" />{tag}
                  </span>
                ))}
              </div>

              <Link to={`/blog/${post.slug}`} className="group block">
                <h2 className="font-heading text-2xl font-bold text-foreground leading-tight mb-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h2>
              </Link>

              <p className="font-serif-body text-sm text-muted-foreground mb-4 leading-relaxed max-w-2xl">
                {post.description}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono-meta">
                  <span>{formatDate(post.publishedAt)}</span>
                  <span className="flex items-center gap-1">
                    <Clock size={11} />
                    {post.readTime}
                  </span>
                </div>
                <Link
                  to={`/blog/${post.slug}`}
                  className="flex items-center gap-1.5 text-xs font-mono-meta text-primary hover:text-primary/80 transition-colors"
                >
                  READ MORE <ArrowRight size={12} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </main>

      <EditorialFooter />
    </div>
  );
}
