import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { isRaycastSkipForced, enableRaycastSkip } from "@/utils/raycastControl";

const getGlobal = () => (typeof window === 'undefined' ? undefined : window);

const getSkipFlag = () => {
  if (isRaycastSkipForced()) return true;
  if (typeof document === 'undefined' || !document.body) return false;
  return document.body.getAttribute('data-no-raycast-bg') === '1';
};

const hasGlobalFailure = () => {
  const w = getGlobal();
  return w?.__VNVNC_RAYCAST_FAILED__ === true;
};

const markGlobalFailure = () => {
  const w = getGlobal();
  if (!w) return;
  w.__VNVNC_RAYCAST_FAILED__ = true;
  w.__VNVNC_FORCE_SKIP_RAYCAST__ = true;
  if (typeof document !== 'undefined' && document.body) {
    document.body.setAttribute('data-no-raycast-bg', '1');
  }
};

export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);

    // Call handler right away so state gets updated with initial window size
    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

export const Component = () => {
  const { width, height } = useWindowSize();
  const [shouldRender, setShouldRender] = useState(false);
  const [Scene, setScene] = useState<any>(null);
  const [shouldSkip, setShouldSkip] = useState(() => getSkipFlag());
  const [hasError, setHasError] = useState(() => hasGlobalFailure());
  const hasViewport = width > 0 && height > 0;

  // detect WebGL support safely
  const hasWebGL = () => {
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    } catch {
      return false;
    }
  };

  // Watch for mutations to the skip flag so we can react immediately
  useEffect(() => {
    if (typeof document === 'undefined' || !document.body) return;
    setShouldSkip(getSkipFlag());

    const observer = new MutationObserver(() => {
      setShouldSkip(getSkipFlag());
    });

    observer.observe(document.body, { attributes: true, attributeFilter: ['data-no-raycast-bg'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (hasError || shouldSkip) {
      if (hasError) {
        markGlobalFailure();
      }
      setShouldRender(false);
      setScene(null);
      return;
    }
    if (!hasViewport || width < 10 || height < 10) return;
    if (!hasWebGL()) return; // no WebGL — do not import the library at all

    let cancelled = false;
    const bail = () => {
      setShouldRender(false);
      setScene(null);
    };
    const markFailed = () => {
      if (!hasError) {
        setHasError(true);
      }
      markGlobalFailure();
      bail();
    };
    // Defer import to next frame to ensure stable layout
    const raf = requestAnimationFrame(() => {
      if (getSkipFlag()) {
        cancelled = true;
        bail();
        return;
      }
      import('unicornstudio-react')
        .then((m) => {
          if (cancelled) return;
          setScene(() => m.default);
          setShouldRender(true);
        })
        .catch(() => {
          if (!cancelled) {
            markFailed();
          }
        });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [shouldSkip, hasViewport, width, height, hasError]);

  if (hasError) {
    enableRaycastSkip();
  }
  if (shouldSkip || !hasViewport || hasError) {
    return null;
  }

  if (!shouldRender || !Scene) {
    // placeholder to keep layout stable without creating WebGL
    return <div className={cn("flex flex-col items-center")} style={{ width, height }} />;
  }

  const UnicornScene = Scene;
  return (
    <div className={cn("flex flex-col items-center")}> 
      <UnicornScene
        production={true}
        projectId="cbmTT38A0CcuYxeiyj5H"
        width={width}
        height={height}
        onError={() => {
          if (!hasError) {
            setHasError(true);
            markGlobalFailure();
          }
          setShouldRender(false);
          setScene(null);
        }}
        onLoad={() => {
          if (!shouldRender) {
            setShouldRender(true);
          }
        }}
      />
    </div>
  );
};
