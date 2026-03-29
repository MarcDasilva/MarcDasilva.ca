/* eslint-disable @next/next/no-img-element */
import { useRef, useEffect, useMemo, useState } from 'react';
import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import './StickerPeel.css';

gsap.registerPlugin(Draggable);

const StickerPeel = ({
  imageSrc,
  rotate = 30,
  peelBackHoverPct = 30,
  peelBackActivePct = 40,
  peelEasing = 'power3.out',
  peelHoverEasing = 'power2.out',
  width = 200,
  shadowIntensity = 0.6,
  lightingIntensity = 0.1,
  initialPosition = 'center',
  peelDirection = 0,
  className = '',
  onDragEnd: onDragEndCallback,
  clampOnResize = true,
  activateAfterMs = 0,
  disablePeel = false,
  allowInteraction = true
}) => {
  const containerRef = useRef(null);
  const dragTargetRef = useRef(null);
  const draggableInstanceRef = useRef(null);
  const [isInteractive, setIsInteractive] = useState(false);

  const defaultPadding = 10;

  useEffect(() => {
    if (!allowInteraction) {
      setIsInteractive(false);
      return;
    }

    let timeoutId = null;
    let idleId = null;

    const enableInteraction = () => {
      timeoutId = window.setTimeout(() => {
        setIsInteractive(true);
      }, activateAfterMs);
    };

    if ('requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(enableInteraction, { timeout: 1500 });
    } else {
      enableInteraction();
    }

    return () => {
      if (timeoutId !== null) window.clearTimeout(timeoutId);
      if (idleId !== null && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleId);
      }
    };
  }, [activateAfterMs, allowInteraction]);

  useEffect(() => {
    const target = dragTargetRef.current;
    if (!target) return;

    let startX = 0,
      startY = 0;

    if (initialPosition === 'center') {
      return;
    }

    if (typeof initialPosition === 'object' && initialPosition.x !== undefined && initialPosition.y !== undefined) {
      startX = initialPosition.x;
      startY = initialPosition.y;
    }

    gsap.set(target, { x: startX, y: startY });
  }, [initialPosition]);

  useEffect(() => {
    if (!isInteractive) return;

    const target = dragTargetRef.current;
    if (!target || !target.parentNode) return;

    const boundsEl = target.parentNode;

    draggableInstanceRef.current = Draggable.create(target, {
      type: 'x,y',
      ...(clampOnResize && { bounds: boundsEl }),
      inertia: false,
      onDrag() {
        const rot = gsap.utils.clamp(-24, 24, this.deltaX * 0.4);
        gsap.set(target, { rotation: rot, force3D: true });
      },
      onDragEnd() {
        const rotationEase = 'power2.out';
        const duration = 0.8;
        gsap.to(target, { rotation: 0, duration, ease: rotationEase });
        if (typeof onDragEndCallback === 'function') {
          const x = gsap.getProperty(target, 'x');
          const y = gsap.getProperty(target, 'y');
          onDragEndCallback(Number(x), Number(y));
        }
      }
    })[0];

    const handleResize = () => {
      if (draggableInstanceRef.current) {
        draggableInstanceRef.current.update();
        if (!clampOnResize) return;

        const currentX = gsap.getProperty(target, 'x');
        const currentY = gsap.getProperty(target, 'y');

        const boundsRect = boundsEl.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();

        const maxX = boundsRect.width - targetRect.width;
        const maxY = boundsRect.height - targetRect.height;

        const newX = Math.max(0, Math.min(currentX, maxX));
        const newY = Math.max(0, Math.min(currentY, maxY));

        if (newX !== currentX || newY !== currentY) {
          gsap.to(target, {
            x: newX,
            y: newY,
            duration: 0.3,
            ease: 'power2.out'
          });
        }
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      if (draggableInstanceRef.current) {
        draggableInstanceRef.current.kill();
        draggableInstanceRef.current = null;
      }
    };
  }, [clampOnResize, isInteractive, onDragEndCallback]);

  useEffect(() => {
    if (!isInteractive) return;

    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = () => {
      container.classList.add('touch-active');
    };

    const handleTouchEnd = () => {
      container.classList.remove('touch-active');
    };

    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchend', handleTouchEnd);
    container.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [isInteractive]);

  const cssVars = useMemo(
    () => ({
      '--sticker-rotate': `${rotate}deg`,
      '--sticker-p': `${defaultPadding}px`,
      '--sticker-peelback-hover': `${peelBackHoverPct}%`,
      '--sticker-peelback-active': `${peelBackActivePct}%`,
      '--sticker-peel-easing': peelEasing,
      '--sticker-peel-hover-easing': peelHoverEasing,
      '--sticker-width': `${width}px`,
      '--sticker-shadow-opacity': shadowIntensity,
      '--sticker-lighting-constant': lightingIntensity,
      '--peel-direction': `${peelDirection}deg`
    }),
    [
      rotate,
      peelBackHoverPct,
      peelBackActivePct,
      peelEasing,
      peelHoverEasing,
      width,
      shadowIntensity,
      lightingIntensity,
      peelDirection
    ]
  );

  const imageProps = {
    src: imageSrc,
    draggable: 'false',
    fetchPriority: 'high',
    loading: 'eager',
    decoding: 'async',
    onContextMenu: e => e.preventDefault()
  };

  return (
    <div
      className={`draggable ${className}`}
      data-sticker-interactive={isInteractive ? 'true' : 'false'}
      ref={dragTargetRef}
      style={cssVars}
    >
      {isInteractive ? (
        <div
          className={disablePeel ? "sticker-static" : "sticker-container"}
          ref={containerRef}
        >
          {disablePeel ? (
            <img {...imageProps} alt="" className="sticker-image" />
          ) : (
            <>
              <div className="sticker-main">
                <div className="sticker-lighting">
                  <img {...imageProps} alt="" className="sticker-image" />
                </div>
              </div>

              <div className="flap">
                <div className="flap-lighting">
                  <img {...imageProps} alt="" className="flap-image" />
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="sticker-static">
          <img {...imageProps} alt="" className="sticker-image" />
        </div>
      )}
    </div>
  );
};

export default StickerPeel;
