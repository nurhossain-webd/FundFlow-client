"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ComponentProps } from "react";

interface RevealProps extends ComponentProps<typeof motion.div> {
  delay?: number;
}

export function Reveal({
  children,
  delay = 0,
  transition,
  ...props
}: RevealProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 22 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.55,
        delay,
        ease: [0.22, 1, 0.36, 1],
        ...transition,
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
