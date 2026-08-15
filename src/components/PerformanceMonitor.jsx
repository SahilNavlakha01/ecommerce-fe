'use client'

import { useEffect, useRef } from 'react';

const PerformanceMonitor = ({ componentName, children }) => {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(Date.now());
  const mountTime = useRef(Date.now());

  useEffect(() => {
    renderCount.current += 1;
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTime.current;
    const timeSinceMount = now - mountTime.current;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${componentName}] Render #${renderCount.current}`, {
        timeSinceLastRender: `${timeSinceLastRender}ms`,
        timeSinceMount: `${timeSinceMount}ms`,
        timestamp: new Date().toISOString()
      });
    }
    
    lastRenderTime.current = now;
  });

  return children;
};

export default PerformanceMonitor;