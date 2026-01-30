"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import DotBackground from "@/components/DotBackground";
import Image from "next/image";
import StickerPeel from "@/components/StickerPeel";

const STICKER_SIZE = 210;

export type StickerConfig = {
  id: string;
  src: string;
  rotate?: number;
};

export const STICKERS: StickerConfig[] = [
  { id: "calcifer", src: "/calcifer_sticker.png", rotate: -15 },
  { id: "goose", src: "/goose.png", rotate: 10 },
  { id: "mlh", src: "/mlh_sticker.png", rotate: -8 },
];

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showContent, setShowContent] = useState(false);
  const [stickerPositions, setStickerPositions] = useState<
    { x: number; y: number }[]
  >([]);
  const [fallenStickerIndices, setFallenStickerIndices] = useState<number[]>([]);
  // Stickers currently playing the fall animation (so we don't block new holds)
  const [animatingOffIndices, setAnimatingOffIndices] = useState<number[]>([]);
  const [resetInstant, setResetInstant] = useState(false);
  const holdTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    if (showContent && typeof window !== "undefined") {
      const width = window.innerWidth;
      const rightX = width - STICKER_SIZE - 40;
      const gap = 20;
      setStickerPositions(
        STICKERS.map((_, i) => ({
          x: rightX,
          y: 20 + i * (STICKER_SIZE + gap),
        }))
      );
    }
  }, [showContent]);

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
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden bg-black">
      <div className="relative w-full h-full flex items-center justify-center">
        <video
          ref={videoRef}
          src="/landinglatest.mp4"
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />

        {showContent && (
          <>
            <DotBackground className="fade-in" />
            {/* Stickers above marc dasilva text */}
            {stickerPositions.length > 0 && (
              <div
                className="absolute top-0 left-0 w-full h-full fade-in"
                style={{ zIndex: 10, pointerEvents: "none" }}
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
                      }}
                      initial={{ y: 0, rotate: 0, opacity: 1 }}
                      animate={
                        isFalling
                          ? {
                              y: "150vh",
                              rotate: 120,
                              opacity: 0,
                            }
                          : { y: 0, rotate: 0, opacity: 1 }
                      }
                      transition={{
                        duration: resetInstant ? 0 : 2,
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
                        width={STICKER_SIZE}
                        initialPosition={pos as any}
                        peelDirection={0}
                        onDragEnd={(x: number, y: number) => {
                          const rounded = { x: Math.round(x), y: Math.round(y) };
                          setStickerPositions((prev) => {
                            const next = [...prev];
                            if (next[i] !== undefined) next[i] = rounded;
                            const byId = STICKERS.reduce<Record<string, { x: number; y: number }>>(
                              (acc, s, idx) => {
                                const p = next[idx];
                                if (p != null) acc[s.id] = p;
                                return acc;
                              },
                              {}
                            );
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
                  width: "clamp(280px, 85vw, 600px)",
                  maxHeight: "clamp(400px, 85vh, 800px)",
                  padding: "clamp(12px, 3vw, 24px) clamp(16px, 4vw, 32px)",
                  fontSize: "clamp(11px, 1.8vw, 14px)",
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
                        fontSize: "3em",
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
                              transition={{ duration: 0.2, ease: "easeInOut" }}
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
                              transition={{ duration: 0.2, ease: "easeInOut" }}
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
          </>
        )}
      </div>
    </div>
  );
}
