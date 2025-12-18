import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '../context/I18nContext';

function KeyboardShortcutsManager() {
  const { t } = useTranslation();
  const [shortcuts] = useState({
    // Navigation shortcuts
    'ctrl+d': () => window.location.hash = '#/dashboard',
    'ctrl+e': () => window.location.hash = '#/equipment',
    'ctrl+m': () => window.location.hash = '#/maintenance',
    'ctrl+q': () => window.location.hash = '#/quality',
    'ctrl+r': () => window.location.hash = '#/reports',
    'ctrl+n': () => window.location.hash = '#/notifications',
    
    // Action shortcuts
    'ctrl+k': () => {
      const searchInput = document.querySelector('[data-search-input]');
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
    },
    'ctrl+shift+?': () => {
      window.dispatchEvent(new CustomEvent('show-shortcuts-help'));
    },
    'ctrl+p': () => {
      window.dispatchEvent(new CustomEvent('print-page'));
    },
    'ctrl+s': (e) => {
      e.preventDefault();
      const saveButton = document.querySelector('[data-save-button]');
      if (saveButton && !saveButton.disabled) {
        saveButton.click();
      }
    },
    'ctrl+shift+n': () => {
      const newButton = document.querySelector('[data-new-button]');
      if (newButton) {
        newButton.click();
      }
    },
    'escape': () => {
      // Close modals
      const closeButtons = document.querySelectorAll('[data-modal-close]');
      if (closeButtons.length > 0) {
        closeButtons[closeButtons.length - 1].click();
      }
    },
    'f5': (e) => {
      // Allow default refresh behavior
      return true;
    }
  });

  const handleKeyDown = useCallback((e) => {
    const key = [];
    
    if (e.ctrlKey || e.metaKey) key.push('ctrl');
    if (e.shiftKey) key.push('shift');
    if (e.altKey) key.push('alt');
    
    // Add the main key
    if (e.key === 'Escape') {
      key.push('escape');
    } else if (e.key === 'F5') {
      key.push('f5');
    } else if (e.key === '?') {
      key.push('?');
    } else {
      key.push(e.key.toLowerCase());
    }
    
    const shortcutKey = key.join('+');
    const handler = shortcuts[shortcutKey];
    
    if (handler) {
      // Don't prevent default for F5 (refresh)
      if (shortcutKey !== 'f5') {
        e.preventDefault();
      }
      
      // Check if we're in an input field (except for specific shortcuts)
      const isInputField = ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName);
      const allowInInput = ['escape', 'f5', 'ctrl+s'].includes(shortcutKey);
      
      if (!isInputField || allowInInput) {
        const result = handler(e);
        // If handler returns true, allow default behavior
        if (result === true && shortcutKey === 'f5') {
          return;
        }
      }
    }
  }, [shortcuts]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // This component doesn't render anything, it just manages shortcuts
  return null;
}

export default KeyboardShortcutsManager;