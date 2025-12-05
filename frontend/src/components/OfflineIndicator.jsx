import { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowToast(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showToast && isOnline) return null;

  return (
    <>
      {/* Persistent offline banner */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white px-4 py-2 text-center text-sm">
          <div className="flex items-center justify-center gap-2">
            <WifiOff className="w-4 h-4" />
            <span>You are offline. Some features may be limited.</span>
          </div>
        </div>
      )}

      {/* Toast notification */}
      {showToast && (
        <div className={`
          fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg
          flex items-center gap-2 animate-slide-in
          ${isOnline ? 'bg-green-600' : 'bg-red-600'} text-white
        `}>
          {isOnline ? (
            <>
              <Wifi className="w-5 h-5" />
              <span>Back online</span>
            </>
          ) : (
            <>
              <WifiOff className="w-5 h-5" />
              <span>Connection lost</span>
            </>
          )}
        </div>
      )}
    </>
  );
}

export default OfflineIndicator;
