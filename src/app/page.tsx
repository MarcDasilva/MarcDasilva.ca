"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import DotBackground from "@/components/DotBackground";
import Image from "next/image";
import StickerPeel from "@/components/StickerPeel";

const STICKER_SIZE = 240;
const DESIGN_WIDTH = 1920;
const DESIGN_HEIGHT = 1080;

export type StickerConfig = {
  id: string;
  src: string;
  rotate?: number;
  width?: number;
};

export const STICKERS: StickerConfig[] = [
  { id: "calcifer", src: "/stickers/calcifer_sticker.png", rotate: -15 },
  { id: "goose", src: "/stickers/goose.png", rotate: 10 },
  { id: "mlh", src: "/stickers/mlh_sticker.png", rotate: -8 },
  { id: "loveworm", src: "/stickers/loveworm.png", rotate: 5 },
  { id: "apple", src: "/stickers/apple.png", rotate: 8 },
  { id: "git", src: "/stickers/git.png", rotate: -5 },
  { id: "chess", src: "/stickers/chess.png", rotate: -12 },
  { id: "aws", src: "/stickers/aws.png", rotate: 5, width: 195 },
  { id: "linux", src: "/stickers/linux.png", rotate: -8, width: 170 },
  { id: "node", src: "/stickers/node.png", rotate: 10, width: 225 },
  { id: "ny", src: "/stickers/ny.png", rotate: -5, width: 170 },
  { id: "python", src: "/stickers/pythonsticker.png", rotate: 8, width: 240 },
  { id: "react", src: "/stickers/react.png", rotate: -12, width: 170 },
  { id: "ruby", src: "/stickers/ruby.png", rotate: 6, width: 170 },
  { id: "bee", src: "/stickers/bee.png", rotate: -6, width: 195 },
  { id: "hackpton", src: "/stickers/hackpton.png", rotate: 7, width: 170 },
  { id: "spotify", src: "/stickers/spotify.png", rotate: -10, width: 200 },
  { id: "mongodb", src: "/stickers/mongodb.png", rotate: 7, width: 350 },
  { id: "postgres", src: "/stickers/postgres.png", rotate: 8, width: 250 },
  { id: "sunny", src: "/stickers/sunny.png", rotate: -5, width: 200 },
  { id: "github", src: "/stickers/github.png", rotate: -6, width: 230 },
  { id: "devpost", src: "/stickers/devpost.png", rotate: 6, width: 200 },
  {
    id: "linkedin",
    src: "/stickers/linkedinsticker.png",
    rotate: 7,
    width: 170,
  },
  { id: "next", src: "/stickers/next.png", rotate: -8, width: 300 },
  { id: "docker", src: "/stickers/docker.png", rotate: -7, width: 250 },
  { id: "fast", src: "/stickers/fast.png", rotate: 20, width: 220 },
  { id: "pytorch", src: "/stickers/pytorch.png", rotate: -9, width: 220 },
  { id: "tailwind", src: "/stickers/tailwind.png", rotate: 8, width: 220 },
  { id: "barbell", src: "/stickers/barbell.png", rotate: 8, width: 320 },
];

function getInitialStickerPositions() {
  const centerX = DESIGN_WIDTH / 2 - STICKER_SIZE / 2;
  const centerY = DESIGN_HEIGHT / 2 - STICKER_SIZE / 2;
  let centerOffset = 0;
  return STICKERS.map((sticker) => {
    const existing = INITIAL_STICKER_POSITIONS[sticker.id];
    if (existing) return existing;
    const offset = centerOffset++;
    return {
      x: centerX + (offset % 3) * 100 - 100,
      y: centerY + Math.floor(offset / 3) * 100 - 100,
    };
  });
}

const INITIAL_STICKER_POSITIONS: Record<string, { x: number; y: number }> = {
  apple: { x: 1444, y: 21 },
  aws: { x: 1683, y: 869 },
  barbell: { x: 176, y: 798 },
  bee: { x: 383, y: 4 },
  calcifer: { x: 1661, y: -17 },
  chess: { x: 1253, y: 98 },
  devpost: { x: 627, y: 77 },
  docker: { x: 396, y: 430 },
  fast: { x: 217, y: 610 },
  git: { x: 164, y: 94 },
  github: { x: 830, y: 19 },
  goose: { x: 1631, y: 634 },
  hackpton: { x: 39, y: 484 },
  linkedin: { x: 1072, y: 107 },
  linux: { x: 1500, y: 536 },
  loveworm: { x: 1675, y: 372 },
  mlh: { x: 1666, y: 227 },
  mongodb: { x: 935, y: 814 },
  next: { x: 629, y: 840 },
  node: { x: 1316, y: 657 },
  ny: { x: 1313, y: 439 },
  postgres: { x: 200, y: 346 },
  python: { x: 1446, y: 793 },
  pytorch: { x: 13, y: 703 },
  react: { x: 1478, y: 313 },
  ruby: { x: 22, y: 28 },
  spotify: { x: 419, y: 211 },
  sunny: { x: 20, y: 232 },
  tailwind: { x: 410, y: 719 },
};

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showContent, setShowContent] = useState(false);
  const [stickerPositions, setStickerPositions] = useState<
    { x: number; y: number }[]
  >([]);
  const [fallenStickerIndices, setFallenStickerIndices] = useState<number[]>(
    [],
  );
  // Stickers currently playing the fall animation (so we don't block new holds)
  const [animatingOffIndices, setAnimatingOffIndices] = useState<number[]>([]);
  const [resetInstant, setResetInstant] = useState(false);
  const [viewportSize, setViewportSize] = useState({
    w: DESIGN_WIDTH,
    h: DESIGN_HEIGHT,
  });
  const holdTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const updateSize = () =>
      setViewportSize({ w: window.innerWidth, h: window.innerHeight });
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      // Freeze on last frame by pausing and setting to the end
      video.pause();
      video.currentTime = video.duration;
      // Show content after a brief delay
      setTimeout(() => {
        setShowContent(true);
        setStickerPositions(getInitialStickerPositions());
      }, 500);
    };

    video.addEventListener("ended", handleEnded);

    // Ensure video plays on load
    video.play().catch((error) => {
      console.error("Error playing video:", error);
    });

    return () => {
      video.removeEventListener("ended", handleEnded);
    };
  }, []);

  useEffect(() => {
    if (!resetInstant) return;
    const id = requestAnimationFrame(() => setResetInstant(false));
    return () => cancelAnimationFrame(id);
  }, [resetInstant]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!e.shiftKey) return;
      if (e.key === "P" || e.key === "p") {
        e.preventDefault();
        setResetInstant(true);
        setFallenStickerIndices([]);
        setAnimatingOffIndices([]);
        if (holdTimeoutRef.current) {
          clearTimeout(holdTimeoutRef.current);
          holdTimeoutRef.current = null;
        }
      } else if (e.key === "O" || e.key === "o") {
        e.preventDefault();
        const video = videoRef.current;
        if (video) {
          video.pause();
          video.currentTime = video.duration;
        }
        setShowContent(true);
        setStickerPositions(getInitialStickerPositions());
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const scale = Math.max(
    viewportSize.w / DESIGN_WIDTH,
    viewportSize.h / DESIGN_HEIGHT,
  );

  return (
    <div className="fixed inset-0 overflow-hidden bg-black">
      {/* Video: always maximized via CSS (inset-0 + object-cover), no JS scale.
          Fills viewport from first paint—avoids aspect ratio jump on load. */}
      <video
        ref={videoRef}
        src="/landinglatest.mp4"
        autoPlay
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />

      {showContent && (
        <div
          className="absolute left-1/2 top-1/2 origin-center"
          style={{
            width: DESIGN_WIDTH,
            height: DESIGN_HEIGHT,
            transform: `translate(-50%, -50%) scale(${scale})`,
            transformOrigin: "center center",
          }}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <DotBackground className="fade-in" />
            {/* Stickers above marc dasilva text */}
            {stickerPositions.length > 0 && (
              <div
                className="absolute top-0 left-0 fade-in"
                style={{
                  width: DESIGN_WIDTH,
                  height: DESIGN_HEIGHT,
                  zIndex: 10,
                  pointerEvents: "none",
                }}
              >
                {STICKERS.map((sticker: StickerConfig, i: number) => {
                  if (fallenStickerIndices.includes(i)) return null;
                  const pos = stickerPositions[i];
                  if (!pos) return null;
                  const isFalling = animatingOffIndices.includes(i);
                  return (
                    <motion.div
                      key={sticker.id}
                      className="absolute cursor-pointer"
                      style={{
                        left: 0,
                        top: 0,
                        width: "100%",
                        height: "100%",
                        pointerEvents: "none",
                        zIndex: isFalling ? 100 : undefined,
                      }}
                      initial={{ y: 0, rotate: 0, opacity: 1 }}
                      animate={
                        isFalling
                          ? {
                              y: "150vh",
                              rotate: 0,
                              opacity: 0,
                            }
                          : { y: 0, rotate: 0, opacity: 1 }
                      }
                      transition={{
                        duration: resetInstant ? 0 : 1.7,
                        ease: [0.25, 0.46, 0.45, 0.94],
                      }}
                      onPointerDownCapture={(e) => {
                        if (e.shiftKey) return;
                        holdTimeoutRef.current = setTimeout(() => {
                          setAnimatingOffIndices((prev) => [...prev, i]);
                          holdTimeoutRef.current = null;
                        }, 300);
                      }}
                      onPointerUpCapture={() => {
                        if (holdTimeoutRef.current) {
                          clearTimeout(holdTimeoutRef.current);
                          holdTimeoutRef.current = null;
                        }
                      }}
                      onPointerCancel={() => {
                        if (holdTimeoutRef.current) {
                          clearTimeout(holdTimeoutRef.current);
                          holdTimeoutRef.current = null;
                        }
                      }}
                      onPointerMoveCapture={() => {
                        if (holdTimeoutRef.current) {
                          clearTimeout(holdTimeoutRef.current);
                          holdTimeoutRef.current = null;
                        }
                      }}
                      onAnimationComplete={() => {
                        setAnimatingOffIndices((prev) => {
                          if (prev.includes(i)) {
                            setFallenStickerIndices((f) => [...f, i]);
                            return prev.filter((j) => j !== i);
                          }
                          return prev;
                        });
                      }}
                    >
                      <StickerPeel
                        imageSrc={sticker.src}
                        rotate={sticker.rotate}
                        width={sticker.width ?? STICKER_SIZE}
                        initialPosition={pos as any}
                        peelDirection={0}
                        clampOnResize={false}
                        onDragEnd={(x: number, y: number) => {
                          const rounded = {
                            x: Math.round(x),
                            y: Math.round(y),
                          };
                          setStickerPositions((prev) => {
                            const next = [...prev];
                            if (next[i] !== undefined) next[i] = rounded;
                            const byId = STICKERS.reduce<
                              Record<string, { x: number; y: number }>
                            >((acc, s, idx) => {
                              const p = next[idx];
                              if (p != null) acc[s.id] = p;
                              return acc;
                            }, {});
                            console.log(`Sticker "${sticker.id}" →`, rounded);
                            console.log("All sticker positions:", byId);
                            return next;
                          });
                        }}
                      />
                    </motion.div>
                  );
                })}
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className="text-black fade-in relative pointer-events-auto"
                style={{
                  width: "clamp(320px, 90vw, 680px)",
                  maxHeight: "clamp(440px, 88vh, 880px)",
                  padding: "clamp(14px, 3.2vw, 28px) clamp(18px, 4.5vw, 36px)",
                  fontSize: "clamp(12px, 2vw, 16px)",
                  overflow: "auto",
                }}
              >
                {/* Header */}
                <div
                  className="flex items-center justify-between mb-4"
                  style={{ marginBottom: "1.2em" }}
                >
                  <div>
                    <div
                      className="font-normal"
                      style={{
                        fontSize: "3.5em",
                        fontFamily: "var(--font-script)",
                        marginTop: "2em",
                      }}
                    >
                      marc dasilva
                    </div>
                    <motion.div
                      className="cursor-pointer"
                      whileHover="hover"
                      initial="initial"
                      variants={{
                        initial: { x: 0 },
                        hover: { x: 5 },
                      }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                    >
                      <div
                        className="flex items-center gap-2"
                        style={{
                          fontSize: "1.2em",
                          marginTop: ".5em",
                          marginBottom: "0",
                          fontWeight: "bold",
                          fontStyle: "italic",
                        }}
                      >
                        Currently
                        <Image
                          src="/9923735.png"
                          alt="Icon"
                          width={20}
                          height={20}
                        />
                      </div>
                      <motion.div
                        className="flex items-center gap-1"
                        style={{
                          fontSize: "1.2em",
                          padding: "0.25em 0.5em",
                          marginLeft: "1.5em",
                          marginTop: "0",
                        }}
                      >
                        <motion.div
                          className="bg-black"
                          style={{
                            width: "0.35em",
                            height: "0.35em",
                          }}
                          variants={{
                            initial: { rotate: 0 },
                            hover: { rotate: 45 },
                          }}
                          transition={{ duration: 0.4, ease: "easeInOut" }}
                        />
                        <span>BME </span>
                        <motion.a
                          href="https://uwaterloo.ca/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-0.5 relative group cursor-pointer"
                          whileHover="hover"
                          initial="initial"
                          style={{ padding: "0.1em 0.1em" }}
                        >
                          <Image
                            src="/uwaterloo.png"
                            alt="UWaterloo"
                            width={20}
                            height={20}
                            style={{ display: "inline-block" }}
                          />
                          <span className="relative">
                            UWaterloo
                            <div
                              className="absolute bottom-0 left-0 bg-gray-400"
                              style={{ width: "100%", height: "1px" }}
                            />
                            <motion.div
                              className="absolute bottom-0 left-0 h-0.5 bg-black z-10"
                              variants={{
                                initial: { width: 0 },
                                hover: { width: "100%" },
                              }}
                              transition={{
                                duration: 0.2,
                                ease: "easeInOut",
                              }}
                            />
                          </span>
                        </motion.a>
                      </motion.div>
                      <motion.div
                        className="flex items-center gap-1"
                        style={{
                          fontSize: "1.2em",
                          padding: "0.25em 0.5em",
                          marginLeft: "1.5em",
                          marginTop: "-0.3em",
                        }}
                      >
                        <motion.div
                          className="bg-black"
                          style={{
                            width: "0.35em",
                            height: "0.35em",
                          }}
                          variants={{
                            initial: { rotate: 0 },
                            hover: { rotate: 45 },
                          }}
                          transition={{ duration: 0.4, ease: "easeInOut" }}
                        />
                        <span>SWE</span>
                        <motion.a
                          href="https://afflo.io/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-0.5 relative group cursor-pointer"
                          whileHover="hover"
                          initial="initial"
                          style={{ padding: "0.1em 0.1em" }}
                        >
                          <Image
                            src="/afflo.png"
                            alt="Afflo"
                            width={20}
                            height={20}
                            style={{ display: "inline-block" }}
                          />
                          <span className="relative">
                            afflo
                            <div
                              className="absolute bottom-0 left-0 bg-gray-400"
                              style={{ width: "100%", height: "1px" }}
                            />
                            <motion.div
                              className="absolute bottom-0 left-0 h-0.5 bg-black z-10"
                              variants={{
                                initial: { width: 0 },
                                hover: { width: "100%" },
                              }}
                              transition={{
                                duration: 0.2,
                                ease: "easeInOut",
                              }}
                            />
                          </span>
                        </motion.a>
                      </motion.div>
                    </motion.div>
                  </div>
                  <div
                    className="flex items-center gap-2 sm:gap-3"
                    style={{ fontSize: "0.9em" }}
                  >
                    <a
                      href="#"
                      className="underline hover:text-black/80 transition-colors"
                    >
                      about
                    </a>
                    <a
                      href="#"
                      className="underline hover:text-black/80 transition-colors"
                    >
                      projects
                    </a>
                    <a
                      href="#"
                      className="underline hover:text-black/80 transition-colors"
                    >
                      writing
                    </a>
                    <button
                      className="flex items-center justify-center hover:opacity-80 transition-opacity"
                      style={{
                        width: "1.4em",
                        height: "1.4em",
                      }}
                    >
                      <svg
                        className="w-full h-full"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    <button
                      className="bg-gray-700 rounded flex items-center justify-center font-medium hover:bg-gray-600 transition-colors"
                      style={{
                        width: "1.8em",
                        height: "1.8em",
                        fontSize: "0.85em",
                      }}
                    >
                      K
                    </button>
                  </div>
                </div>

                {/* What I've been building */}
                <div style={{ marginBottom: "1.2em" }}>
                  <div
                    className="font-bold italic"
                    style={{ marginBottom: "0.6em", fontSize: "1.2em" }}
                  >
                    what i've been building:
                  </div>
                  <ul className="space-y-0.5" style={{ marginLeft: "2em" }}>
                    <li>
                      created <strong>Cursor for 3D modeling</strong> (3M+
                      views, 1,900+ stars, inbound VC interest from Sequoia,
                      a16z, GC, others)
                    </li>
                    <li>
                      shipped a <strong>product</strong> in &lt; 2 days to
                      10,000+ users
                    </li>
                    <li>
                      did it again with another <strong>product</strong> (1,000+
                      users in &lt; 24 hours)
                    </li>
                    <li>
                      built a <strong>deep learning framework</strong> from
                      scratch in C++
                    </li>
                  </ul>
                </div>

                {/* Previously */}
                <div style={{ marginBottom: "1.2em" }}>
                  <div
                    className="font-bold italic"
                    style={{ marginBottom: "0.6em", fontSize: "1.2em" }}
                  >
                    previously:
                  </div>
                  <ul className="space-y-0.5" style={{ marginLeft: "2em" }}>
                    <li className="flex items-center gap-2">
                      <div
                        className="bg-green-500 rounded-sm flex items-center justify-center"
                        style={{
                          width: "1.2em",
                          height: "1.2em",
                          fontSize: "0.7em",
                        }}
                      >
                        🛍
                      </div>
                      <a
                        href="#"
                        className="underline hover:text-black/80 transition-colors"
                      >
                        Shopify
                      </a>
                    </li>
                    <li className="flex items-center gap-2">
                      <div
                        className="bg-red-500 rounded-sm flex items-center justify-center text-white"
                        style={{
                          width: "1.2em",
                          height: "1.2em",
                          fontSize: "0.75em",
                        }}
                      >
                        B
                      </div>
                      <a
                        href="#"
                        className="underline hover:text-black/80 transition-colors"
                      >
                        Browserbase
                      </a>
                    </li>
                    <li className="flex items-center gap-2">
                      <div
                        className="bg-green-400 rounded-sm flex items-center justify-center"
                        style={{
                          width: "1.2em",
                          height: "1.2em",
                          fontSize: "0.7em",
                        }}
                      >
                        ☘
                      </div>
                      <a
                        href="#"
                        className="underline hover:text-black/80 transition-colors"
                      >
                        Sunnybrook
                      </a>
                    </li>
                    <li className="flex items-center gap-2">
                      <div
                        className="bg-amber-700 rounded-full flex items-center justify-center text-white"
                        style={{
                          width: "1.2em",
                          height: "1.2em",
                          fontSize: "0.75em",
                        }}
                      >
                        W
                      </div>
                      <a
                        href="#"
                        className="underline hover:text-black/80 transition-colors"
                      >
                        UWaterloo
                      </a>
                    </li>
                  </ul>
                </div>

                {/* Bottom Button */}
                <div style={{ marginTop: "1.2em" }}>
                  <button
                    className="w-full bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-between transition-colors text-white"
                    style={{
                      padding: "0.9em 1.5em",
                      fontSize: "0.95em",
                    }}
                  >
                    <span>see what i've built</span>
                    <div
                      className="border border-white/40"
                      style={{
                        width: "0.9em",
                        height: "0.9em",
                      }}
                    ></div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
