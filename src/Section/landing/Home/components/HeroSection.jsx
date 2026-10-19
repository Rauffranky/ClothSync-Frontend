import {
  ArrowDown,
  ArrowRight,
  Check,
  Radio,
  ScanLine,
  Shirt,
  Truck,
  Building2,
} from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../../../../Components/UI/Button";
import Reveal from "./Reveal";

const journey = [
  {
    icon: Building2,
    label: "At your business",
    detail: "Tagged & accounted for",
  },
  { icon: Truck, label: "On the move", detail: "Dispatched to your laundry" },
  {
    icon: Shirt,
    label: "Clean & returned",
    detail: "Verified at every handoff",
  },
];

export default function HeroSection() {
  return (
    <section className="home-hero home-container" aria-labelledby="home-title">
      <Reveal>
        <p className="home-eyebrow">
          <span className="home-status-dot" /> SMART. CLEAN. CONNECTED.
        </p>
        <h1 id="home-title">
          Every thread.
          <br />
          Every journey.
          <br />
          <span>All in sync.</span>
        </h1>
        <p className="home-intro">
          From the first check-in to the final return. Bring your linen,
          laundry partners, and people together with Trackly.
        </p>
        <div className="home-actions">
          <Button
            as={Link}
            to="/business/signup"
            size="lg"
            rightIcon={<ArrowRight size={18} />}
          >
            Get started
          </Button>
          <Button
            as="a"
            href="#overview"
            size="lg"
            variant="outline"
            leftIcon={<ArrowDown size={17} />}
          >
            Explore Trackly
          </Button>
        </div>
        <div className="home-hero-notes">
          <span>
            <Check size={15} /> Connected asset tracking
          </span>
          <span>
            <Check size={15} /> Connected portals
          </span>
        </div>
      </Reveal>
      <Reveal className="home-visual" delay={0.15}>
        <div className="home-visual-top">
          <span>
            <Radio size={16} /> THE CONNECTED LINEN JOURNEY
          </span>
          <span className="home-mini-pill">TRACKLY</span>
        </div>
        <div className="home-shirt-scene" aria-hidden="true">
          <div className="home-orbit" />
          <div className="home-orbit home-orbit-inner" />
          <div className="home-shirt">
            <Shirt size={115} strokeWidth={1.1} />
            <div className="home-tag">
              <Radio size={16} /> ITEM TAG
            </div>
          </div>
          <div className="home-scan-badge">
            <ScanLine size={20} />
            <div>
              <strong>A little tag. A clear picture.</strong>
              <span>Identity stays with every item.</span>
            </div>
          </div>
        </div>
        <div className="home-journey-list">
          {journey.map(({ icon: Icon, label, detail }, i) => (
            <div className="home-journey-row" key={label}>
              <span className="home-icon">
                <Icon size={19} />
              </span>
              <div>
                <strong>{label}</strong>
                <span>{detail}</span>
              </div>
              <span className="home-step-number">0{i + 1}</span>
            </div>
          ))}
        </div>
        <p className="home-visual-caption">
          One item. One identity. Full visibility.
        </p>
      </Reveal>
      <div className="home-industry-strip">
        <span>BUILT FOR THE LINEN ECONOMY</span>
        <strong>Hospitality</strong>
        <span>+</span>
        <strong>Healthcare</strong>
        <span>+</span>
        <strong>Commercial laundries</strong>
      </div>
    </section>
  );
}
