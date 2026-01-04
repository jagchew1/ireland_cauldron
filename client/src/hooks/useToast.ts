import { useCallback } from 'react';

export function useToast() {
  const toast = useCallback((msg: string) => {
    // minimal placeholder toast
    console.log('[toast]', msg);
  }, []);
  return { toast };
}
