import { type MouseEvent, useEffect, useRef, useState } from "react";

export const SundayFreeBadge = () => {
  const ref = useRef<HTMLAnchorElement>(null);
  const [firstOverlayPosition, setFirstOverlayPosition] = useState<number>(0);
  const [matrix, setMatrix] = useState<string>("1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1");
  const [currentMatrix, setCurrentMatrix] = useState<string>("1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1");
  const [disableInOutOverlayAnimation, setDisableInOutOverlayAnimation] = useState<boolean>(true);
  const [disableOverlayAnimation, setDisableOverlayAnimation] = useState<boolean>(false);
  const [isTimeoutFinished, setIsTimeoutFinished] = useState<boolean>(false);
  const enterTimeout = useRef<NodeJS.Timeout | null>(null);
  const leaveTimeout1 = useRef<NodeJS.Timeout | null>(null);
  const leaveTimeout2 = useRef<NodeJS.Timeout | null>(null);
  const leaveTimeout3 = useRef<NodeJS.Timeout | null>(null);

  const identityMatrix = "1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1";
  const maxRotate = 0.25;
  const minRotate = -0.25;
  const maxScale = 1;
  const minScale = 0.97;

  const getDimensions = () => {
    const left = ref?.current?.getBoundingClientRect()?.left || 0;
    const right = ref?.current?.getBoundingClientRect()?.right || 0;
    const top = ref?.current?.getBoundingClientRect()?.top || 0;
    const bottom = ref?.current?.getBoundingClientRect()?.bottom || 0;
    return { left, right, top, bottom };
  };

  const getMatrix = (clientX: number, clientY: number) => {
    const { left, right, top, bottom } = getDimensions();
    const xCenter = (left + right) / 2;
    const yCenter = (top + bottom) / 2;

    const scale = [
      maxScale - (maxScale - minScale) * Math.abs(xCenter - clientX) / (xCenter - left),
      maxScale - (maxScale - minScale) * Math.abs(yCenter - clientY) / (yCenter - top),
      maxScale - (maxScale - minScale) * (Math.abs(xCenter - clientX) + Math.abs(yCenter - clientY)) / (xCenter - left + yCenter - top)
    ];

    const rotate = {
      x1: 0.25 * ((yCenter - clientY) / yCenter - (xCenter - clientX) / xCenter),
      x2: maxRotate - (maxRotate - minRotate) * Math.abs(right - clientX) / (right - left),
      x3: 0,
      y0: 0,
      y2: maxRotate - (maxRotate - minRotate) * (top - clientY) / (top - bottom),
      y3: 0,
      z0: -(maxRotate - (maxRotate - minRotate) * Math.abs(right - clientX) / (right - left)),
      z1: (0.2 - (0.2 + 0.6) * (top - clientY) / (top - bottom)),
      z3: 0
    };
    return `${scale[0]}, ${rotate.y0}, ${rotate.z0}, 0, ` +
      `${rotate.x1}, ${scale[1]}, ${rotate.z1}, 0, ` +
      `${rotate.x2}, ${rotate.y2}, ${scale[2]}, 0, ` +
      `${rotate.x3}, ${rotate.y3}, ${rotate.z3}, 1`;
  };

  const getOppositeMatrix = (_matrix: string, clientY: number, onMouseEnter?: boolean) => {
    const { top, bottom } = getDimensions();
    const oppositeY = bottom - clientY + top;
    const weakening = onMouseEnter ? 0.7 : 4;
    const multiplier = onMouseEnter ? -1 : 1;

    return _matrix.split(", ").map((item, index) => {
      if (index === 2 || index === 4 || index === 8) {
        return String(-parseFloat(item) * multiplier / weakening);
      } else if (index === 0 || index === 5 || index === 10) {
        return "1";
      } else if (index === 6) {
        return String(multiplier * (maxRotate - (maxRotate - minRotate) * (top - oppositeY) / (top - bottom)) / weakening);
      } else if (index === 9) {
        return String((maxRotate - (maxRotate - minRotate) * (top - oppositeY) / (top - bottom)) / weakening);
      }
      return item;
    }).join(", ");
  };

  const onMouseEnter = (e: MouseEvent<HTMLAnchorElement>) => {
    if (leaveTimeout1.current) clearTimeout(leaveTimeout1.current);
    if (leaveTimeout2.current) clearTimeout(leaveTimeout2.current);
    if (leaveTimeout3.current) clearTimeout(leaveTimeout3.current);
    setDisableOverlayAnimation(true);

    const { left, right, top, bottom } = getDimensions();
    const xCenter = (left + right) / 2;
    const yCenter = (top + bottom) / 2;

    setDisableInOutOverlayAnimation(false);
    enterTimeout.current = setTimeout(() => setDisableInOutOverlayAnimation(true), 350);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setFirstOverlayPosition((Math.abs(xCenter - e.clientX) + Math.abs(yCenter - e.clientY)) / 1.5);
      });
    });

    const matrix = getMatrix(e.clientX, e.clientY);
    const oppositeMatrix = getOppositeMatrix(matrix, e.clientY, true);

    setMatrix(oppositeMatrix);
    setIsTimeoutFinished(false);
    setTimeout(() => setIsTimeoutFinished(true), 200);
  };

  const onMouseMove = (e: MouseEvent<HTMLAnchorElement>) => {
    const { left, right, top, bottom } = getDimensions();
    const xCenter = (left + right) / 2;
    const yCenter = (top + bottom) / 2;

    setTimeout(() => setFirstOverlayPosition((Math.abs(xCenter - e.clientX) + Math.abs(yCenter - e.clientY)) / 1.5), 150);

    if (isTimeoutFinished) {
      setCurrentMatrix(getMatrix(e.clientX, e.clientY));
    }
  };

  const onMouseLeave = (e: MouseEvent<HTMLAnchorElement>) => {
    const oppositeMatrix = getOppositeMatrix(matrix, e.clientY);

    if (enterTimeout.current) clearTimeout(enterTimeout.current);

    setCurrentMatrix(oppositeMatrix);
    setTimeout(() => setCurrentMatrix(identityMatrix), 200);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setDisableInOutOverlayAnimation(false);
        leaveTimeout1.current = setTimeout(() => setFirstOverlayPosition(-firstOverlayPosition / 4), 150);
        leaveTimeout2.current = setTimeout(() => setFirstOverlayPosition(0), 300);
        leaveTimeout3.current = setTimeout(() => {
          setDisableOverlayAnimation(false);
          setDisableInOutOverlayAnimation(true);
        }, 500);
      });
    });
  };

  useEffect(() => {
    if (isTimeoutFinished) {
      setMatrix(currentMatrix);
    }
  }, [currentMatrix, isTimeoutFinished]);

  const overlayAnimations = [...Array(10).keys()].map((e) => (
    `
    @keyframes overlayAnimation${e + 1} {
      0% { transform: rotate(${e * 10}deg); }
      50% { transform: rotate(${(e + 1) * 10}deg); }
      100% { transform: rotate(${e * 10}deg); }
    }
    `
  )).join(" ");

  return (
    <a
      href="https://t.me/s/vnvnc_spb?q=%D0%B2%D1%81%D0%B5%20%D1%81%D0%B2%D0%BE%D0%B8"
      target="_blank"
      rel="noopener noreferrer"
      ref={ref}
      className="block w-[225px] sm:w-[325px] h-auto cursor-pointer"
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onMouseEnter={onMouseEnter}
    >
      <style>{overlayAnimations}</style>
      <div
        style={{
          transform: `perspective(700px) matrix3d(${matrix})`,
          transformOrigin: "center center",
          transition: "transform 200ms ease-out"
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 325 68" className="w-[225px] sm:w-[325px] h-auto">
          <defs>
            <filter id="blur1">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
            </filter>
            <mask id="badgeMask">
              <rect width="325" height="68" fill="white" rx="12" />
            </mask>
          </defs>

          {/* Background - silver/gray like original */}
          <rect width="325" height="68" rx="12" fill="#ddd" />

          {/* Border */}
          <rect x="5" y="5" width="315" height="58" rx="10" fill="transparent" stroke="#bbb" strokeWidth="1.25" />

          {/* First line text */}
          <text fontFamily="Helvetica-Bold, Helvetica" fontSize="15" fontWeight="bold" fill="#666" x="65" y="30" letterSpacing="3">
            БЕСПЛАТНЫЙ ВХОД*
          </text>

          {/* Second line text */}
          <text fontFamily="Helvetica-Bold, Helvetica" fontSize="15" fontWeight="bold" fill="#666" x="65" y="48" letterSpacing="2">
            КАЖДОЕ ВОСКРЕСЕНЬЕ
          </text>

          {/* Disclaimer */}
          <text
            fontFamily="Helvetica, Arial, sans-serif"
            fontSize="12"
            fill="#777"
            x="162.5"
            y="61"
            textAnchor="middle"
            letterSpacing="1"
            opacity="0.7"
          >
            *кроме праздников и специальных событий
          </text>

          {/* Logo SVG */}
          <g transform="translate(10, 11)">
            <image
              href="/symbol_club.svg"
              width="45"
              height="45"
              opacity="0.8"
            />
          </g>

          {/* Overlay effects with rainbow colors */}
          <g style={{ mixBlendMode: "overlay" }} mask="url(#badgeMask)">
            <g style={{
              transform: `rotate(${firstOverlayPosition}deg)`,
              transformOrigin: "center center",
              transition: !disableInOutOverlayAnimation ? "transform 200ms ease-out" : "none",
              animation: disableOverlayAnimation ? "none" : "overlayAnimation1 5s infinite",
              willChange: "transform"
            }}>
              <polygon points="0,0 325,68 325,0 0,68" fill="hsl(358, 100%, 62%)" filter="url(#blur1)" opacity="0.5" />
            </g>
            <g style={{
              transform: `rotate(${firstOverlayPosition + 10}deg)`,
              transformOrigin: "center center",
              transition: !disableInOutOverlayAnimation ? "transform 200ms ease-out" : "none",
              animation: disableOverlayAnimation ? "none" : "overlayAnimation2 5s infinite",
              willChange: "transform"
            }}>
              <polygon points="0,0 325,68 325,0 0,68" fill="hsl(30, 100%, 50%)" filter="url(#blur1)" opacity="0.5" />
            </g>
            <g style={{
              transform: `rotate(${firstOverlayPosition + 20}deg)`,
              transformOrigin: "center center",
              transition: !disableInOutOverlayAnimation ? "transform 200ms ease-out" : "none",
              animation: disableOverlayAnimation ? "none" : "overlayAnimation3 5s infinite",
              willChange: "transform"
            }}>
              <polygon points="0,0 325,68 325,0 0,68" fill="hsl(60, 100%, 50%)" filter="url(#blur1)" opacity="0.5" />
            </g>
            <g style={{
              transform: `rotate(${firstOverlayPosition + 30}deg)`,
              transformOrigin: "center center",
              transition: !disableInOutOverlayAnimation ? "transform 200ms ease-out" : "none",
              animation: disableOverlayAnimation ? "none" : "overlayAnimation4 5s infinite",
              willChange: "transform"
            }}>
              <polygon points="0,0 325,68 325,0 0,68" fill="hsl(96, 100%, 50%)" filter="url(#blur1)" opacity="0.5" />
            </g>
            <g style={{
              transform: `rotate(${firstOverlayPosition + 40}deg)`,
              transformOrigin: "center center",
              transition: !disableInOutOverlayAnimation ? "transform 200ms ease-out" : "none",
              animation: disableOverlayAnimation ? "none" : "overlayAnimation5 5s infinite",
              willChange: "transform"
            }}>
              <polygon points="0,0 325,68 325,0 0,68" fill="hsl(233, 85%, 47%)" filter="url(#blur1)" opacity="0.5" />
            </g>
            <g style={{
              transform: `rotate(${firstOverlayPosition + 50}deg)`,
              transformOrigin: "center center",
              transition: !disableInOutOverlayAnimation ? "transform 200ms ease-out" : "none",
              animation: disableOverlayAnimation ? "none" : "overlayAnimation6 5s infinite",
              willChange: "transform"
            }}>
              <polygon points="0,0 325,68 325,0 0,68" fill="hsl(271, 85%, 47%)" filter="url(#blur1)" opacity="0.5" />
            </g>
            <g style={{
              transform: `rotate(${firstOverlayPosition + 60}deg)`,
              transformOrigin: "center center",
              transition: !disableInOutOverlayAnimation ? "transform 200ms ease-out" : "none",
              animation: disableOverlayAnimation ? "none" : "overlayAnimation7 5s infinite",
              willChange: "transform"
            }}>
              <polygon points="0,0 325,68 325,0 0,68" fill="hsl(300, 20%, 35%)" filter="url(#blur1)" opacity="0.5" />
            </g>
            <g style={{
              transform: `rotate(${firstOverlayPosition + 70}deg)`,
              transformOrigin: "center center",
              transition: !disableInOutOverlayAnimation ? "transform 200ms ease-out" : "none",
              animation: disableOverlayAnimation ? "none" : "overlayAnimation8 5s infinite",
              willChange: "transform"
            }}>
              <polygon points="0,0 325,68 325,0 0,68" fill="transparent" filter="url(#blur1)" opacity="0.5" />
            </g>
            <g style={{
              transform: `rotate(${firstOverlayPosition + 80}deg)`,
              transformOrigin: "center center",
              transition: !disableInOutOverlayAnimation ? "transform 200ms ease-out" : "none",
              animation: disableOverlayAnimation ? "none" : "overlayAnimation9 5s infinite",
              willChange: "transform"
            }}>
              <polygon points="0,0 325,68 325,0 0,68" fill="transparent" filter="url(#blur1)" opacity="0.5" />
            </g>
            <g style={{
              transform: `rotate(${firstOverlayPosition + 90}deg)`,
              transformOrigin: "center center",
              transition: !disableInOutOverlayAnimation ? "transform 200ms ease-out" : "none",
              animation: disableOverlayAnimation ? "none" : "overlayAnimation10 5s infinite",
              willChange: "transform"
            }}>
              <polygon points="0,0 325,68 325,0 0,68" fill="white" filter="url(#blur1)" opacity="0.5" />
            </g>
          </g>
        </svg>
      </div>
    </a>
  );
};