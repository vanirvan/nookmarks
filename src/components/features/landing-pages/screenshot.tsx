"use client";

import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function Screenshot() {
  const sectionRef = useRef(null);
  const [isShrunk, setIsShrunk] = useState(false);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["50% end", "end start"],
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (latest > 0) {
      setIsShrunk(true);
    } else {
      setIsShrunk(false);
    }
  });

  return (
    <section id="screenshot" className="relative w-full">
      <div ref={sectionRef} className="px-4">
        <motion.div
          layout
          transition={{ type: "spring", bounce: 0.2, duration: 0.8 }}
          className={cn(
            "bg-primary w-full mx-auto rounded-md aspect-video",
            isShrunk ? "max-w-5xl" : "max-w-7xl",
          )}
        ></motion.div>
      </div>
    </section>
  );
}
