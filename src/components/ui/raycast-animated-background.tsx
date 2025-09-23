import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import UnicornScene from "unicornstudio-react";

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

// Hook for device orientation (accelerometer)
const useDeviceOrientation = () => {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>(0);

  useEffect(() => {
    // Check if we're on mobile/tablet
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (!isMobile) return;

    // Check if permission is needed (iOS 13+)
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      setShowButton(true);
    } else {
      // Non-iOS devices or older versions - start immediately
      setPermissionGranted(true);
    }
  }, []);

  useEffect(() => {
    if (!permissionGranted) return;

    let lastX = 0;
    let lastY = 0;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      // Cancel previous animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(() => {
        // For iOS: gamma is left-right tilt (-90 to 90), beta is front-back (-90 to 90)
        // For Android: gamma is left-right (-90 to 90), beta is front-back (-180 to 180)
        const gamma = event.gamma || 0;
        const beta = event.beta || 0;

        // Normalize values
        const x = Math.max(-1, Math.min(1, gamma / 45)); // More sensitive range
        const y = Math.max(-1, Math.min(1, beta / 45));

        // Apply smoothing
        const smoothing = 0.3;
        const smoothX = lastX * (1 - smoothing) + x * smoothing;
        const smoothY = lastY * (1 - smoothing) + y * smoothing;

        lastX = smoothX;
        lastY = smoothY;

        // Convert to screen coordinates
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        // Higher sensitivity for better response
        const sensitivity = 1.2;
        const mouseX = centerX + (smoothX * centerX * sensitivity);
        const mouseY = centerY + (smoothY * centerY * sensitivity);

        // Dispatch synthetic mouse event
        if (containerRef.current) {
          const syntheticEvent = new MouseEvent('mousemove', {
            clientX: mouseX,
            clientY: mouseY,
            bubbles: true,
            cancelable: true,
            view: window
          });

          // Dispatch to the UnicornScene container
          const unicornContainer = containerRef.current.querySelector('div');
          if (unicornContainer) {
            unicornContainer.dispatchEvent(syntheticEvent);
          }
          containerRef.current.dispatchEvent(syntheticEvent);

          // Also dispatch to document for broader compatibility
          document.dispatchEvent(syntheticEvent);
        }
      });
    };

    window.addEventListener('deviceorientation', handleOrientation);

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [permissionGranted]);

  const requestPermission = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission === 'granted') {
          setPermissionGranted(true);
          setShowButton(false);
        }
      } catch (error) {
        console.log('Device orientation permission denied');
      }
    }
  };

  return { containerRef, showButton, requestPermission };
};

export const Component = () => {
  const { width, height } = useWindowSize();
  const { containerRef, showButton, requestPermission } = useDeviceOrientation();

  return (
    <div ref={containerRef} className={cn("flex flex-col items-center relative")}>
      {showButton && (
        <button
          onClick={requestPermission}
          className="absolute top-4 right-4 z-50 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white text-sm hover:bg-white/20 transition-colors"
        >
          Включить управление наклоном
        </button>
      )}
      <UnicornScene
        production={true}
        projectId="cbmTT38A0CcuYxeiyj5H"
        width={width}
        height={height}
      />
    </div>
  );
};