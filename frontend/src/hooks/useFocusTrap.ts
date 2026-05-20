/**
 * useFocusTrap — keyboard-accessible modal helper.
 *
 *   const ref = useRef<HTMLDivElement>(null);
 *   useFocusTrap(ref, isOpen, { onEscape: () => setOpen(false) });
 *   return <div ref={ref} role="dialog" aria-modal="true"> … </div>;
 *
 * On open:
 *   - Saves whatever element was previously focused.
 *   - Moves focus to the first interactive descendant (or the element marked
 *     `data-autofocus`).
 *   - Locks Tab / Shift+Tab to cycle within the container.
 *   - Closes on Escape via `onEscape` (if provided).
 *
 * On close (or unmount): restores focus to whatever held it before open.
 *
 * No dependencies. Safe to use alongside Radix primitives (Radix's own
 * Dialog already does this — only call here for custom modals).
 */
import { useEffect, type RefObject } from "react";

const FOCUSABLE_SELECTOR = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled]):not([type='hidden'])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
    "[contenteditable='true']",
].join(",");

interface Options {
    onEscape?: () => void;
    /** When true, do NOT auto-move focus on open (useful if caller handles it). */
    skipInitialFocus?: boolean;
}

export function useFocusTrap(
    containerRef: RefObject<HTMLElement>,
    isOpen: boolean,
    options: Options = {}
): void {
    const { onEscape, skipInitialFocus = false } = options;

    useEffect(() => {
        if (!isOpen) return;
        const container = containerRef.current;
        if (!container) return;

        const previouslyFocused = document.activeElement as HTMLElement | null;

        // Initial focus: prefer [data-autofocus], fall back to first focusable.
        if (!skipInitialFocus) {
            const auto = container.querySelector<HTMLElement>("[data-autofocus]");
            const focusables = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
            const target = auto || focusables[0] || container;
            // requestAnimationFrame so it lands after the modal's own mount work.
            requestAnimationFrame(() => target.focus({ preventScroll: false }));
        }

        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape" && onEscape) {
                e.preventDefault();
                onEscape();
                return;
            }
            if (e.key !== "Tab") return;
            const focusables = Array.from(
                container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
            ).filter(el => !el.hasAttribute("disabled") && el.offsetParent !== null);
            if (focusables.length === 0) {
                e.preventDefault();
                return;
            }
            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            const active = document.activeElement as HTMLElement | null;
            if (e.shiftKey && active === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && active === last) {
                e.preventDefault();
                first.focus();
            }
        };

        document.addEventListener("keydown", handleKey, true);
        return () => {
            document.removeEventListener("keydown", handleKey, true);
            // Restore focus to whatever was focused before opening.
            if (previouslyFocused && document.body.contains(previouslyFocused)) {
                previouslyFocused.focus({ preventScroll: true });
            }
        };
    }, [isOpen, containerRef, onEscape, skipInitialFocus]);
}
