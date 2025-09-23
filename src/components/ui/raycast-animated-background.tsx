import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
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

export const Component = () => {
  const { width, height } = useWindowSize();
  const [shouldRender, setShouldRender] = useState(false);
  const hasViewport = width > 0 && height > 0;

  useEffect(() => {
    if (hasViewport && !shouldRender) {
      setShouldRender(true);
    }
  }, [hasViewport, shouldRender]);

  if (!shouldRender || !hasViewport) {
    // Avoid instantiating UnicornScene until we have real viewport dimensions
    return <div className={cn("flex flex-col items-center")} style={{ width, height }} />;
  }

  return (
    <div className={cn("flex flex-col items-center")}>
      <UnicornScene
        production={true}
        projectId="cbmTT38A0CcuYxeiyj5H"
        width={width}
        height={height}
      />
    </div>
  );
};
