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
  href?: string;
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
  {
    id: "github",
    src: "/stickers/github.png",
    rotate: -6,
    width: 230,
    href: "https://github.com/MarcDasilva",
  },
  {
    id: "devpost",
    src: "/stickers/devpost.png",
    rotate: 6,
    width: 200,
    href: "https://devpost.com/marcdasilva",
  },
  {
    id: "linkedin",
    src: "/stickers/linkedinsticker.png",
    rotate: 7,
    width: 170,
    href: "https://www.linkedin.com/in/marcdasilva1/",
  },
  { id: "next", src: "/stickers/next.png", rotate: -8, width: 300 },
  { id: "docker", src: "/stickers/docker.png", rotate: -7, width: 250 },
  { id: "fast", src: "/stickers/fast.png", rotate: 20, width: 220 },
  { id: "pytorch", src: "/stickers/pytorch.png", rotate: -9, width: 220 },
  { id: "tailwind", src: "/stickers/tailwind.png", rotate: 8, width: 220 },
  { id: "barbell", src: "/stickers/barbell.png", rotate: 8, width: 320 },
  { id: "hover", src: "/stickers/hover.png", rotate: -20, width: 320 },
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
  devpost: { x: 637, y: 811 },
  docker: { x: 396, y: 430 },
  fast: { x: 217, y: 610 },
  git: { x: 164, y: 94 },
  github: { x: 845, y: 768 },
  goose: { x: 1631, y: 634 },
  hackpton: { x: 39, y: 484 },
  linkedin: { x: 1110, y: 829 },
  linux: { x: 1500, y: 536 },
  loveworm: { x: 1675, y: 372 },
  mlh: { x: 1666, y: 227 },
  mongodb: { x: 952, y: -70 },
  next: { x: 656, y: -40 },
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
  hover: { x: 1103, y: 565 },
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
  const tapStickerRef = useRef<{ index: number; moved: boolean }>({
    index: -1,
    moved: false,
  });

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
                        if (sticker.href)
                          tapStickerRef.current = { index: i, moved: false };
                        holdTimeoutRef.current = setTimeout(() => {
                          setAnimatingOffIndices((prev) => [...prev, i]);
                          holdTimeoutRef.current = null;
                        }, 300);
                      }}
                      onPointerUpCapture={() => {
                        if (
                          tapStickerRef.current.index === i &&
                          !tapStickerRef.current.moved &&
                          sticker.href
                        ) {
                          window.open(
                            sticker.href,
                            "_blank",
                            "noopener,noreferrer",
                          );
                        }
                        tapStickerRef.current = { index: -1, moved: false };
                        if (holdTimeoutRef.current) {
                          clearTimeout(holdTimeoutRef.current);
                          holdTimeoutRef.current = null;
                        }
                      }}
                      onPointerCancel={() => {
                        tapStickerRef.current = { index: -1, moved: false };
                        if (holdTimeoutRef.current) {
                          clearTimeout(holdTimeoutRef.current);
                          holdTimeoutRef.current = null;
                        }
                      }}
                      onPointerMoveCapture={() => {
                        if (tapStickerRef.current.index === i)
                          tapStickerRef.current.moved = true;
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
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{ paddingBottom: "15vh" }}
            >
              <div
                className="text-black fade-in relative pointer-events-auto"
                style={{
                  width: "clamp(320px, 90vw, 680px)",
                  maxHeight: "clamp(440px, 88vh, 880px)",
                  padding: "clamp(14px, 3.2vw, 28px) clamp(18px, 4.5vw, 36px)",
                  fontSize: "clamp(12px, 2vw, 16px)",
                  overflow: "visible",
                }}
              >
                {/* Header */}
                <div className="mb-4" style={{ marginBottom: "1.2em" }}>
                  <div
                    className="font-normal"
                    style={{
                      fontSize: "4em",
                      fontFamily: "var(--font-script)",
                      marginTop: "1em",
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
                      className="flex cursor-pointer items-center gap-1"
                      style={{
                        fontSize: "1.2em",
                        padding: "0.25em 0.5em",
                        marginLeft: "1.5em",
                        marginTop: "0",
                      }}
                      whileHover="hover"
                      initial="initial"
                      variants={{
                        initial: { x: 0 },
                        hover: { x: 5 },
                      }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                    >
                      <motion.div
                        className="bg-black shrink-0"
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
                      <span>BME + SE</span>
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
                      className="flex cursor-pointer items-center gap-1"
                      style={{
                        fontSize: "1.2em",
                        padding: "0.25em 0.5em",
                        marginLeft: "1.5em",
                        marginTop: "-0.3em",
                      }}
                      whileHover="hover"
                      initial="initial"
                      variants={{
                        initial: { x: 0 },
                        hover: { x: 5 },
                      }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                    >
                      <motion.div
                        className="bg-black shrink-0"
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

                {/* What I've been building */}
                <motion.div
                  className="cursor-pointer"
                  style={{ marginBottom: "1.2em" }}
                  whileHover="hover"
                  initial="initial"
                  variants={{
                    initial: { x: 0 },
                    hover: { x: 5 },
                  }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                  <div
                    className="flex items-center gap-2 font-bold italic"
                    style={{ marginBottom: "0.6em", fontSize: "1.2em" }}
                  >
                    What I've Been Building
                    <Image
                      src="/9923735.png"
                      alt=""
                      width={20}
                      height={20}
                      className="shrink-0"
                    />
                  </div>
                  <ul
                    className="space-y-0.5"
                    style={{ marginLeft: "2em", fontSize: "1.2em" }}
                  >
                    <motion.li
                      className="flex cursor-pointer flex-col gap-0"
                      whileHover="hover"
                      initial="initial"
                      variants={{
                        initial: { x: 0 },
                        hover: { x: 5 },
                      }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                    >
                      <div className="flex items-center gap-1">
                        <motion.div
                          className="bg-black shrink-0"
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
                        <span>
                          Created{" "}
                          <motion.strong
                            style={{ fontStyle: "italic" }}
                            className="relative cursor-default inline"
                            whileHover="hover"
                            initial="initial"
                          >
                            Cursor for Cameras
                            <span
                              className="absolute bottom-0 left-0 bg-gray-400 block"
                              style={{ width: "100%", height: "1px" }}
                            />
                            <motion.span
                              className="absolute bottom-0 left-0 h-0.5 bg-black z-10 block"
                              variants={{
                                initial: { width: 0 },
                                hover: { width: "100%" },
                              }}
                              transition={{
                                duration: 0.2,
                                ease: "easeInOut",
                              }}
                            />
                          </motion.strong>{" "}
                          @ the biggest hackathon ever
                        </span>
                      </div>
                      <span
                        className="block"
                        style={{
                          marginLeft: "calc(0.35em + 0.25rem)",
                        }}
                      >
                        (1st @ NexHacks, $10,000 prize, Incoming billboard in
                        NYC)
                      </span>
                    </motion.li>
                    <motion.li
                      className="flex cursor-pointer flex-col gap-0"
                      whileHover="hover"
                      initial="initial"
                      variants={{
                        initial: { x: 0 },
                        hover: { x: 5 },
                      }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                    >
                      <div className="flex items-center gap-1">
                        <motion.div
                          className="bg-black shrink-0"
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
                        <span>
                          Built{" "}
                          <motion.strong
                            style={{ fontStyle: "italic" }}
                            className="relative cursor-default inline"
                            whileHover="hover"
                            initial="initial"
                          >
                            Shazam for Movies
                            <span
                              className="absolute bottom-0 left-0 bg-gray-400 block"
                              style={{ width: "100%", height: "1px" }}
                            />
                            <motion.span
                              className="absolute bottom-0 left-0 h-0.5 bg-black z-10 block"
                              variants={{
                                initial: { width: 0 },
                                hover: { width: "100%" },
                              }}
                              transition={{
                                duration: 0.2,
                                ease: "easeInOut",
                              }}
                            />
                          </motion.strong>
                        </span>
                      </div>
                      <span
                        className="block"
                        style={{
                          marginLeft: "calc(0.35em + 0.25rem)",
                        }}
                      >
                        (1500+ Users, 100,000+ Impressions)
                      </span>
                    </motion.li>

                    <motion.li
                      className="flex cursor-pointer items-center gap-1"
                      whileHover="hover"
                      initial="initial"
                      variants={{
                        initial: { x: 0 },
                        hover: { x: 5 },
                      }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                    >
                      <motion.div
                        className="bg-black shrink-0"
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
                      Created{" "}
                      <motion.strong
                        className="relative cursor-default inline"
                        whileHover="hover"
                        initial="initial"
                      >
                        FB For Food Donations
                        <span
                          className="absolute bottom-0 left-0 bg-gray-400 block"
                          style={{ width: "100%", height: "1px" }}
                        />
                        <motion.span
                          className="absolute bottom-0 left-0 h-0.5 bg-black z-10 block"
                          variants={{
                            initial: { width: 0 },
                            hover: { width: "100%" },
                          }}
                          transition={{
                            duration: 0.2,
                            ease: "easeInOut",
                          }}
                        />
                      </motion.strong>{" "}
                      @ Princeton
                    </motion.li>
                  </ul>
                </motion.div>

                {/* Previously */}
                <motion.div
                  className="cursor-pointer"
                  style={{ marginBottom: "1.2em" }}
                  whileHover="hover"
                  initial="initial"
                  variants={{
                    initial: { x: 0 },
                    hover: { x: 5 },
                  }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                  <div
                    className="flex items-center gap-2 font-bold italic"
                    style={{ marginBottom: "0", fontSize: "1.2em" }}
                  >
                    Previously
                    <Image
                      src="/9923735.png"
                      alt=""
                      width={20}
                      height={20}
                      className="shrink-0"
                    />
                  </div>
                  <ul
                    className="space-y-0"
                    style={{
                      marginLeft: "1.5em",
                      marginTop: "-0.15em",
                      fontSize: "1.2em",
                    }}
                  >
                    <motion.li
                      className="flex cursor-pointer items-center gap-1"
                      style={{ padding: "0.25em 0.5em" }}
                      whileHover="hover"
                      initial="initial"
                      variants={{
                        initial: { x: 0 },
                        hover: { x: 5 },
                      }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                    >
                      <motion.div
                        className="bg-black shrink-0"
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
                      <div className="flex items-center gap-1">
                        <span>Researcher</span>
                        <motion.a
                          href="https://rhse.temertymedicine.utoronto.ca/research"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-0 relative group cursor-pointer"
                          whileHover="hover"
                          initial="initial"
                          style={{ padding: "0.1em 0" }}
                        >
                          <Image
                            src="/uoft.png"
                            alt="Uoft"
                            width={20}
                            height={20}
                            className="shrink-0"
                          />
                          <span className="relative">
                            Uoft
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
                      </div>
                    </motion.li>
                    <motion.li
                      className="flex cursor-pointer items-center gap-1"
                      style={{
                        padding: "0.25em 0.5em",
                        marginTop: "-0.2em",
                      }}
                      whileHover="hover"
                      initial="initial"
                      variants={{
                        initial: { x: 0 },
                        hover: { x: 5 },
                      }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                    >
                      <motion.div
                        className="bg-black shrink-0"
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
                      <motion.div
                        className="flex items-center gap-0 relative group cursor-default"
                        whileHover="hover"
                        initial="initial"
                        style={{ padding: "0.1em 0" }}
                      >
                        <Image
                          src="/HEI_logo.png"
                          alt="HEI"
                          width={40}
                          height={40}
                          className="shrink-0"
                        />
                        <span className="relative">
                          HEI
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
                      </motion.div>
                    </motion.li>
                  </ul>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
