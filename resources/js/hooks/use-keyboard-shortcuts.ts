import { useEffect } from 'react';

interface KeyboardShortcut {
    key: string;
    ctrlKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
    callback: () => void;
    description?: string;
}

/**
 * Hook to register keyboard shortcuts
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled = true) {
    useEffect(() => {
        if (!enabled) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            shortcuts.forEach((shortcut) => {
                const ctrlMatch = shortcut.ctrlKey ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
                const shiftMatch = shortcut.shiftKey ? event.shiftKey : !event.shiftKey;
                const altMatch = shortcut.altKey ? event.altKey : !event.altKey;

                if (event.key.toLowerCase() === shortcut.key.toLowerCase() && ctrlMatch && shiftMatch && altMatch) {
                    event.preventDefault();
                    shortcut.callback();
                }
            });
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [shortcuts, enabled]);
}
