import { useEffect } from 'react';
import { enableRaycastSkip, disableRaycastSkip } from '../utils/raycastControl';

export const useRaycastSkip = (active: boolean) => {
  useEffect(() => {
    if (!active) return;
    enableRaycastSkip();
    return () => {
      disableRaycastSkip();
    };
  }, [active]);
};
