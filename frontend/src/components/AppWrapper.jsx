import { ThemeProvider } from '../context/ThemeContext';
import { NotificationProvider } from './NotificationSystem';
import KeyboardShortcutsManager from './KeyboardShortcutsManager';

function AppWrapper({ children }) {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <KeyboardShortcutsManager />
        {children}
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default AppWrapper;