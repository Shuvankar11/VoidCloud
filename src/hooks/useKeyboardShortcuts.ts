import { useEffect } from 'react';

export interface ShortcutHandlers {
  onEscape?: () => void;
  onSearchFocus?: () => void;
  onOpenShortcuts?: () => void;
}

/**
 * useKeyboardShortcuts Hook
 * Global event listener for power user navigation hotkeys.
 */
export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input or textarea
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      if (e.key === 'Escape') {
        handlers.onEscape?.();
      }

      if (e.key === '/' && !isInput) {
        e.preventDefault();
        handlers.onSearchFocus?.();
      }

      if (e.key === '?' && !isInput) {
        e.preventDefault();
        handlers.onOpenShortcuts?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
}
