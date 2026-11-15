"use client";

import React from "react";
import { motion } from "framer-motion";

interface AnimatedBracketProps {
  text: string;
  className?: string;
  delay?: number;
}

export function AnimatedBracket({
  text,
  className = "",
  delay = 0,
}: AnimatedBracketProps) {
  return (
    <motion.span
      initial={{ opacity: 0, width: 0, scale: 0.7 }}
      whileInView={{ opacity: 1, width: "auto", scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={`editorial-bracket overflow-hidden mx-1.5 sm:mx-2.5 align-middle select-none ${className}`}
      style={{ display: "inline-flex" }}
    >
      <span className="text-[10px] sm:text-xs font-semibold tracking-wider text-black uppercase whitespace-nowrap">
        {text}
      </span>
    </motion.span>
  );
}
