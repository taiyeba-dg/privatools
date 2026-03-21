import { useParams, Link } from "react-router-dom";
import { EditorialMasthead } from "@/components/EditorialMasthead";
import { EditorialFooter } from "@/components/EditorialFooter";
import { getBlogPost, blogPosts } from "@/data/blog";
import { ArrowLeft, Clock, Tag, ArrowRight } from "lucide-react";
import NotFound from "./NotFound";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = getBlogPost(slug ?? "");

  if (!post) return <NotFound />;

  const others = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <EditorialMasthead />

      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
        <nav className="mb-8">
          <Link
            to="/blog"
            className="flex items-center gap-1.5 text-xs font-mono-meta text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={12} /> ALL ARTICLES
          </Link>
        </nav>

        <article>
          <header className="mb-8">
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag) => (
                <span key={tag} className="category-tag text-xs">
                  <Tag size={9} className="inline mr-1" />{tag}
                </span>
              ))}
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl font-black text-foreground leading-tight mb-4">
              {post.title}
            </h1>

            <p className="font-serif-body text-base text-muted-foreground mb-5 leading-relaxed">
              {post.description}
            </p>

            <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono-meta pb-6 border-b border-border/60">
              <span>PrivaTools Team</span>
              <span>·</span>
              <span>{formatDate(post.publishedAt)}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock size={11} />
                {post.readTime}
              </span>
            </div>
          </header>

          <div
            className="blog-prose"
            dangerouslySetInnerHTML={{ __html: post.body }}
          />
        </article>

        {others.length > 0 && (
          <aside className="mt-16 pt-8 border-t border-border/60">
            <div className="section-flag mb-6">MORE ARTICLES</div>
            <div className="space-y-6">
              {others.map((p) => (
                <div key={p.slug} className="flex items-start justify-between gap-4 py-4 border-b border-border/30 last:border-0">
                  <div className="min-w-0">
                    <Link
                      to={`/blog/${p.slug}`}
                      className="font-heading text-base font-bold text-foreground hover:text-primary transition-colors block mb-1 leading-tight"
                    >
                      {p.title}
                    </Link>
                    <span className="text-xs text-muted-foreground font-mono-meta flex items-center gap-1">
                      <Clock size={10} /> {p.readTime}
                    </span>
                  </div>
                  <Link to={`/blog/${p.slug}`} className="shrink-0 text-muted-foreground hover:text-primary transition-colors mt-1">
                    <ArrowRight size={14} />
                  </Link>
                </div>
              ))}
            </div>
          </aside>
        )}
      </main>

      <EditorialFooter />
    </div>
  );
}
