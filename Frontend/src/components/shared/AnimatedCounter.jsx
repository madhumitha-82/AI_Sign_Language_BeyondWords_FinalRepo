import React, { useEffect, useRef } from "react";
import { animate } from "framer-motion";

export function AnimatedCounter({ from = 0, to, duration = 1, className }) {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const controls = animate(from, to, {
      duration,
      ease: "easeOut",
      onUpdate(value) {
        node.textContent = Math.round(value).toLocaleString();
      },
    });

    return () => controls.stop();
  }, [from, to, duration]);

  return (
    <span ref={ref} className={className}>
      {from}
    </span>
  );
}
