import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';

function LoadingSpinner({ 
  size = 'md', 
  variant = 'spinner',
  message = '',
  state = 'loading', // loading, success, error
  className = ''
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const getIcon = () => {
    switch (state) {
      case 'success':
        return <CheckCircle className={`${sizeClasses[size]} text-green-500`} />;
      case 'error':
        return <AlertCircle className={`${sizeClasses[size]} text-red-500`} />;
      default:
        return <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-500`} />;
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'dots':
        return 'flex space-x-1';
      case 'pulse':
        return 'animate-pulse';
      case 'bounce':
        return 'animate-bounce';
      default:
        return 'flex items-center justify-center';
    }
  };

  if (variant === 'dots') {
    return (
      <div className={`flex items-center justify-center space-x-2 ${className}`}>
        <div className="flex space-x-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`${sizeClasses[size]} bg-blue-500 rounded-full animate-pulse`}
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: '1s'
              }}
            />
          ))}
        </div>
        {message && (
          <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
            {message}
          </span>
        )}
      </div>
    );
  }

  if (variant === 'skeleton') {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (variant === 'progress') {
    return (
      <div className={`w-full ${className}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {message || 'Loading...'}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '45%' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center ${getVariantClasses()} ${className}`}>
      {getIcon()}
      {message && (
        <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
          {message}
        </span>
      )}
    </div>
  );
}

// Full page loading overlay
export function LoadingOverlay({ message = 'Loading...', visible = true }) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl">
        <LoadingSpinner size="lg" message={message} />
      </div>
    </div>
  );
}

// Inline loading state for buttons
export function ButtonSpinner({ size = 'sm' }) {
  return <Loader2 className={`${size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} animate-spin`} />;
}

export default LoadingSpinner;