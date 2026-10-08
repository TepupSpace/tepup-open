import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Hook for tracking block interaction and triggering onComplete once.
 * Used by interactive block components (calculator, slider, budget, etc.)
 * to signal completion to the learn page.
 */
export function useBlockInteraction(onComplete?: () => void) {
  const [hasInteracted, setHasInteracted] = useState(false);
  // Synced after commit, not during render: the callback is only ever read from
  // event handlers, which run after the latest commit anyway.
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  });
  /** Guards the one-time call. A ref, not `hasInteracted`, so two events handled
   *  before a re-render still fire onComplete only once. */
  const firedRef = useRef(false);

  // onComplete is called from the handler itself, not inside a setState updater:
  // updaters must stay pure (StrictMode runs them twice).
  const markInteracted = useCallback(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    setHasInteracted(true);
    onCompleteRef.current?.();
  }, []);

  return { hasInteracted, markInteracted };
}
