import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border group-[.toaster]:border-border group-[.toaster]:shadow-[0_8px_24px_-6px_rgba(20,15,5,0.15),0_4px_8px_-2px_rgba(20,15,5,0.08)] group-[.toaster]:rounded-xl group-[.toaster]:font-sans",
          title: "group-[.toast]:font-display group-[.toast]:font-semibold group-[.toast]:tracking-[-0.015em]",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:text-[12.5px]",
          actionButton:
            "group-[.toast]:bg-accent group-[.toast]:text-accent-foreground group-[.toast]:rounded-md group-[.toast]:font-medium",
          cancelButton: "group-[.toast]:bg-secondary group-[.toast]:text-muted-foreground group-[.toast]:rounded-md",
          success: "group-[.toaster]:border-accent/40 group-[.toaster]:bg-accent/[0.04]",
          error: "group-[.toaster]:border-destructive/40 group-[.toaster]:bg-destructive/[0.04]",
          warning: "group-[.toaster]:border-copper/40 group-[.toaster]:bg-copper-soft/40",
          info: "group-[.toaster]:border-border group-[.toaster]:bg-card",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
