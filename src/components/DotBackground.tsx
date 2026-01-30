"use client";

import React from "react";

interface DotBackgroundProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function DotBackground({
  className = "",
  style,
}: DotBackgroundProps) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{
        backgroundImage: `radial-gradient(circle, rgba(0,0,0,0.1) 1.5px, transparent 1.5px)`,
        backgroundSize: "16px 16px",
        ...style,
      }}
    />
  );
}
