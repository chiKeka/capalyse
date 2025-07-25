import { useEffect, useState } from 'react';

/**
 * Returns true if the component has mounted (client-side).
 * @example
 * const hasMounted = useHasMounted();
 * if (!hasMounted) return null;
 */
export function useHasMounted(): boolean {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => setHasMounted(true), []);
  return hasMounted;
}
