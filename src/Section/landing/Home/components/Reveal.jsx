import { motion, useReducedMotion } from "framer-motion";
import { useContext } from "react";
import { IntroReadyContext } from "../../../../Config/introContext";

export default function Reveal({
  children,
  className = "",
  delay = 0,
  lift = false,
}) {
  const reducedMotion = useReducedMotion();
  const introReady = useContext(IntroReadyContext);
  return (
    <motion.div
      className={className}
      initial={reducedMotion ? false : { opacity: 0, y: 40, scale: 0.98 }}
      whileInView={
        introReady || reducedMotion
          ? { opacity: 1, y: 0, scale: 1 }
          : { opacity: 0, y: 40, scale: 0.98 }
      }
      whileHover={
        lift && !reducedMotion
          ? { y: -7, transition: { duration: 0.22 } }
          : undefined
      }
      viewport={{ once: true, amount: 0.12 }}
      transition={{
        duration: reducedMotion ? 0 : 0.85,
        delay: reducedMotion ? 0 : delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
