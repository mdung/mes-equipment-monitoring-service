import { useEffect, useRef } from 'react';

function usePerformanceMonitor(componentName, enabled = process.env.NODE_ENV === 'development') {
  const renderCount = useRef(0);
  const startTime = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    renderCount.current += 1;
    startTime.current = performance.now();

    return () => {
      if (startTime.current) {
        const endTime = performance.now();
        const renderTime = endTime - startTime.current;
        
        console.log(`[Performance] ${componentName}:`, {
          renderCount: renderCount.current,
          renderTime: `${renderTime.toFixed(2)}ms`,
          timestamp: new Date().toISOString()
        });
      }
    };
  });

  // Memory usage monitoring
  useEffect(() => {
    if (!enabled || !window.performance?.memory) return;

    const logMemoryUsage = () => {
      const memory = window.performance.memory;
      console.log(`[Memory] ${componentName}:`, {
        used: `${(memory.usedJSHeapSize / 1048576).toFixed(2)} MB`,
        total: `${(memory.totalJSHeapSize / 1048576).toFixed(2)} MB`,
        limit: `${(memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`
      });
    };

    const interval = setInterval(logMemoryUsage, 10000); // Log every 10 seconds
    return () => clearInterval(interval);
  }, [componentName, enabled]);

  return {
    renderCount: renderCount.current,
    markRender: () => {
      if (enabled) {
        console.log(`[Render] ${componentName} rendered ${renderCount.current} times`);
      }
    }
  };
}

export default usePerformanceMonitor;