import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { MotionConfig, useReducedMotion } from "framer-motion";
import HeroSection from "./components/HeroSection";
import FeaturesSection from "./components/FeaturesSection";
import InventorySection from "./components/InventorySection";
import WorkflowSection from "./components/WorkflowSection";
import VideoSection from "./components/VideoSection";
import PortalsSection from "./components/PortalsSection";
import "./home.css";

export default function HomeSection() {
  const { hash } = useLocation();
  const reducedMotion = useReducedMotion();

  // Resolve anchors after the lazy-loaded home sections have mounted.
  useEffect(() => {
    if (!hash) return;
    document.getElementById(hash.slice(1))?.scrollIntoView({
      behavior: reducedMotion ? "instant" : "smooth",
    });
  }, [hash, reducedMotion]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="trackly-home">
        <HeroSection />
        <FeaturesSection />
        <InventorySection />
        <WorkflowSection />
        <VideoSection />
        <PortalsSection />
      </div>
    </MotionConfig>
  );
}
