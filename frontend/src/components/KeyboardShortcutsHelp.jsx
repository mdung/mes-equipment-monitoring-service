import { useState, useEffect } from 'react';
import { X, Keyboard } from 'lucide-react';
import { useTranslation } from '../context/I18nContext';
import Modal from './Modal';

function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const handleShowHelp = () => setIsOpen(true);
    window.addEventListener('show-shortcuts-help', handleShowHelp);
    return () => window.removeEventListener('show-shortcuts-help', handleShowHelp);
  }, []);

  const shortcuts = [
    {
      category: t('shortcuts.general'),
      items: [
        { key: 'Ctrl + K', description: t('shortcuts.search') },
        { key: 'Ctrl + ?', description: t('shortcuts.help') },
        { key: 'F5', description: t('shortcuts.refresh') },
        { key: 'Esc', description: 'Close modals/Cancel' }
      ]
    },
    {
      category: t('shortcuts.navigation'),
      items: [
        { key: 'Ctrl + D', description: t('shortcuts.dashboard') },
        { key: 'Ctrl + E', description: t('shortcuts.equipment') },
        { key: 'Ctrl + M', description: t('shortcuts.maintenance') },
        { key: 'Ctrl + Q', description: t('shortcuts.quality') },
        { key: 'Ctrl + R', description: t('shortcuts.reports') },
        { key: 'Ctrl + N', description: t('shortcuts.notifications') }
      ]
    },
    {
      category: t('shortcuts.actions'),
      items: [
        { key: 'Ctrl + S', description: t('shortcuts.save') },
        { key: 'Ctrl + Shift + N', description: t('shortcuts.new') },
        { key: 'Ctrl + P', description: t('shortcuts.print') }
      ]
    }
  ];

  return (
    <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={t('shortcuts.title')}>
      <div className="space-y-6">
        {shortcuts.map((section, index) => (
          <div key={index}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              {section.category}
            </h3>
            <div className="space-y-2">
              {section.items.map((shortcut, idx) => (
                <div key={idx} className="flex justify-between items-center py-2 px-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {shortcut.description}
                  </span>
                  <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-200 border border-gray-300 rounded dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500">
                    {shortcut.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}

export default KeyboardShortcutsHelp;