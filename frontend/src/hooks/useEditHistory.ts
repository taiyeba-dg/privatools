/**
 * useEditHistory — generic undo/redo stack for any editor.
 *
 *   const history = useEditHistory<Edit[]>([]);
 *   history.present       // current state
 *   history.set(next)     // push to history (Cmd+Z can undo)
 *   history.setTransient  // replace current frame without growing history
 *                          // (use during drag — only commit on mouseup)
 *   history.undo()        // Cmd+Z
 *   history.redo()        // Cmd+Shift+Z
 *   history.canUndo
 *   history.canRedo
 *   history.reset(value)  // clear stack, start fresh
 *
 * Stack is capped at MAX_HISTORY frames so a long editing session doesn't
 * grow memory unboundedly.
 */
import { useCallback, useRef, useState } from "react";

const MAX_HISTORY = 100;

export interface EditHistory<T> {
    present: T;
    set: (next: T) => void;
    setTransient: (next: T) => void;
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    reset: (value: T) => void;
}

export function useEditHistory<T>(initial: T): EditHistory<T> {
    const [stack, setStack] = useState<T[]>([initial]);
    const [index, setIndex] = useState(0);
    // Ref keeps the live index for setStack callbacks that race the closure.
    const indexRef = useRef(0);
    indexRef.current = index;

    const set = useCallback((next: T) => {
        setStack(prev => {
            const truncated = prev.slice(0, indexRef.current + 1);
            const grown = [...truncated, next];
            const capped = grown.length > MAX_HISTORY ? grown.slice(-MAX_HISTORY) : grown;
            // New index is the last entry of `capped` after slicing.
            setIndex(capped.length - 1);
            return capped;
        });
    }, []);

    const setTransient = useCallback((next: T) => {
        setStack(prev => {
            // Replace the current frame in place — index stays put.
            const copy = prev.slice();
            copy[indexRef.current] = next;
            return copy;
        });
    }, []);

    const undo = useCallback(() => {
        setIndex(i => Math.max(0, i - 1));
    }, []);

    const redo = useCallback(() => {
        setIndex(i => Math.min(stack.length - 1, i + 1));
    }, [stack.length]);

    const reset = useCallback((value: T) => {
        setStack([value]);
        setIndex(0);
    }, []);

    return {
        present: stack[index],
        set,
        setTransient,
        undo,
        redo,
        canUndo: index > 0,
        canRedo: index < stack.length - 1,
        reset,
    };
}
