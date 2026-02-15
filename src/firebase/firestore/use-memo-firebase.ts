'use client';

import { useMemo, useRef } from 'react';

/**
 * A hook that memoizes a value, but only if its dependencies change.
 * Useful for stabilizing Firestore queries and references that are created
 * inline but depend on state or props.
 */
export function useMemoFirebase<T>(factory: () => T, deps: any[]): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, deps);
}
