import { useState, useCallback, useRef } from 'react';

/**
 * Hook for tracking block interaction and triggering onComplete once.
 * Used by interactive block components (calculator, slider, budget, etc.)
 * to signal completion to the learn page.
 */
export function useBlockInteraction(onComplete?: () => void) {
  const [hasInteracted, setHasInteracted] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const markInteracted = useCallback(() => {
    setHasInteracted(prev => {
      if (!prev) {
        onCompleteRef.current?.();
        return true;
      }
      return prev;
    });
  }, []);

  return { hasInteracted, markInteracted };
}
