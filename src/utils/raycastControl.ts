const ATTR_NAME = 'data-no-raycast-bg';

declare global {
  interface Window {
    __VNVNC_RAYCAST_SKIP_COUNT__?: number;
    __VNVNC_FORCE_SKIP_RAYCAST__?: boolean;
    __VNVNC_RAYCAST_FAILED__?: boolean;
  }
}

const getSafeWindow = () => (typeof window === 'undefined' ? undefined : window);

export const enableRaycastSkip = () => {
  if (typeof document === 'undefined') return;
  const body = document.body;
  if (!body) return;

  const w = getSafeWindow();
  if (w) {
    const next = (w.__VNVNC_RAYCAST_SKIP_COUNT__ ?? 0) + 1;
    w.__VNVNC_RAYCAST_SKIP_COUNT__ = next;
    w.__VNVNC_FORCE_SKIP_RAYCAST__ = true;
  }

  body.setAttribute(ATTR_NAME, '1');
};

export const disableRaycastSkip = () => {
  if (typeof document === 'undefined') return;
  const body = document.body;
  if (!body) return;

  const w = getSafeWindow();
  if (w) {
    const current = w.__VNVNC_RAYCAST_SKIP_COUNT__ ?? 0;
    const next = current > 0 ? current - 1 : 0;
    w.__VNVNC_RAYCAST_SKIP_COUNT__ = next;
    if (next === 0) {
      w.__VNVNC_FORCE_SKIP_RAYCAST__ = false;
      if (!w.__VNVNC_RAYCAST_FAILED__) {
        body.removeAttribute(ATTR_NAME);
      }
      return;
    }
  }

  // Fallback: only remove if there is no explicit skip flag.
  if (!body.getAttribute(ATTR_NAME)) return;
  if (!getSafeWindow()?.__VNVNC_FORCE_SKIP_RAYCAST__) {
    body.removeAttribute(ATTR_NAME);
  }
};

export const isRaycastSkipForced = () => {
  const w = getSafeWindow();
  if (!w) return false;
  return w.__VNVNC_FORCE_SKIP_RAYCAST__ === true;
};
