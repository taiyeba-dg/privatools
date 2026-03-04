import { LucideIcon } from "lucide-react";
import { ToolCard } from "./ToolCard";
import { cn } from "@/lib/utils";
import { Category } from "@/data/tools";

interface Tool {
  slug: string;
  icon: LucideIcon;
  name: string;
  description: string;
}

interface CategorySectionProps {
  title: string;
  subtitle: string;
  category: Category;
  tools: Tool[];
  accent: string;
}

export function CategorySection({ title, subtitle, category, tools, accent }: CategorySectionProps) {
  return (
    <section className="py-10">
      <div className="flex items-end gap-4 mb-6">
        <div>
          <span className={cn("text-xs font-semibold uppercase tracking-widest mb-1.5 block", accent)}>{title}</span>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {tools.map((tool) => (
          <ToolCard key={tool.name} {...tool} category={category} />
        ))}
      </div>
    </section>
  );
}
