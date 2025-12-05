import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Keyboard } from 'lucide-react';
import Modal from './Modal';

const KeyboardShortcuts = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [shortcuts, setShortcuts] = useState([]);

  useEffect(() => {
    const shortcutsList = [
      { key: 'Ctrl+K / Cmd+K', action: t('shortcuts.search'), description: 'Focus search' },
      { key: 'Ctrl+N / Cmd+N', action: t('shortcuts.new'), description: 'Create new item' },
      { key: 'Ctrl+S / Cmd+S', action: t('shortcuts.save'), description: 'Save current form' },
      { key: 'Esc', action: t('shortcuts.cancel'), description: 'Close modal/cancel' },
      { key: 'Ctrl+D / Cmd+D', action: t('shortcuts.delete'), description: 'Delete selected' },
      { key: 'Ctrl+P / Cmd+P', action: t('shortcuts.print'), description: 'Print current page' },
      { key: 'Ctrl+E / Cmd+E', action: t('shortcuts.export'), description: 'Export data' },
      { key: 'Ctrl+Shift+D / Cmd+Shift+D', action: t('shortcuts.toggleTheme'), description: 'Toggle dark mode' },
      { key: '?', action: t('shortcuts.showShortcuts'), description: 'Show this help' },
    ];
    setShortcuts(shortcutsList);

    const handleKeyDown = (e) => {
      // Show shortcuts modal with ?
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        setIsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [t]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-secondary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
        title={t('shortcuts.title')}
      >
        <Keyboard size={20} />
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={t('shortcuts.title')}>
        <div className="space-y-4">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex items-center justify-between p-3 border-b dark:border-slate-700">
              <div className="flex-1">
                <p className="font-medium text-sm">{shortcut.action}</p>
                <p className="text-xs text-secondary dark:text-slate-400">{shortcut.description}</p>
              </div>
              <kbd className="px-3 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-sm font-mono">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
};

export default KeyboardShortcuts;

