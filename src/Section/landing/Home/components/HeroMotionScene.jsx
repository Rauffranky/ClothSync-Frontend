import { useContext, useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Radio, ScanLine, Shirt } from "lucide-react";
import { IntroReadyContext } from "../../../../Config/introContext";

export default function HeroMotionScene() {
  const sceneRef = useRef(null);
  const inView = useInView(sceneRef, { amount: 0.2 });
  const introReady = useContext(IntroReadyContext);
  const reducedMotion = useReducedMotion();
  const playing = inView && introReady && !reducedMotion;

  return (
    <div ref={sceneRef} className="home-shirt-scene" aria-hidden="true">
      <motion.div
        className="home-orbit home-orbit-moving"
        animate={{ rotate: playing ? 360 : 0 }}
        transition={
          playing
            ? { duration: 28, repeat: Infinity, ease: "linear" }
            : { duration: 0 }
        }
      />
      <motion.div
        className="home-orbit home-orbit-inner"
        animate={
          playing
            ? { scale: [1, 1.07, 1], opacity: [0.45, 1, 0.45] }
            : { scale: 1, opacity: 1 }
        }
        transition={
          playing
            ? { duration: 4, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0 }
        }
      />
      <motion.div
        className="home-shirt"
        animate={
          playing
            ? { y: [0, -12, 0], rotate: [-2, 2, -2] }
            : { y: 0, rotate: 0 }
        }
        transition={
          playing
            ? { duration: 5, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0 }
        }
      >
        <Shirt size={115} strokeWidth={1.1} />
        <div className="home-tag">
          <Radio size={16} /> ITEM TAG
        </div>
      </motion.div>
      <motion.div
        className="home-motion-scan"
        animate={
          playing ? { y: [-65, 65, -65], opacity: [0, 0.8, 0] } : { opacity: 0 }
        }
        transition={
          playing
            ? { duration: 4, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0 }
        }
      />
      <motion.div
        className="home-scan-badge"
        animate={playing ? { y: [0, -5, 0] } : { y: 0 }}
        transition={
          playing
            ? { duration: 5, delay: 0.5, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0 }
        }
      >
        <ScanLine size={20} />
        <div>
          <strong>A little tag. A clear picture.</strong>
          <span>Identity stays with every item.</span>
        </div>
      </motion.div>
    </div>
  );
}
