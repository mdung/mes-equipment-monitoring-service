import { useEffect } from 'react';

export const useKeyboardShortcuts = (shortcuts = []) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;
      const alt = e.altKey;

      shortcuts.forEach(({ key: shortcutKey, handler, preventDefault = true }) => {
        const keys = shortcutKey.toLowerCase().split('+').map(k => k.trim());
        const matchCtrl = keys.includes('ctrl') || keys.includes('cmd') ? ctrl : !ctrl && !e.metaKey;
        const matchShift = keys.includes('shift') ? shift : !shift;
        const matchAlt = keys.includes('alt') ? alt : !alt;
        const matchKey = keys.some(k => k === key || (k === 'ctrl' && ctrl) || (k === 'cmd' && e.metaKey) || (k === 'shift' && shift) || (k === 'alt' && alt));

        if (matchCtrl && matchShift && matchAlt && matchKey) {
          if (preventDefault) {
            e.preventDefault();
          }
          handler(e);
        }
      });
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};

