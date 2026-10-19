import {
  ArrowUpRight,
  BedDouble,
  HeartPulse,
  WashingMachine,
} from "lucide-react";
import Card from "../../../../Components/UI/Card";
import Reveal from "./Reveal";

const industries = [
  {
    icon: BedDouble,
    name: "Hospitality",
    label: "FROM CHECK-IN TO CHECK-OUT",
    text: "Keep guest linen, towels, and uniforms moving with every stay.",
    tags: ["Hotels", "Resorts", "Guest linen"],
    accent: "var(--color-aurora-teal)",
  },
  {
    icon: HeartPulse,
    name: "Healthcare",
    label: "CLARITY AT EVERY HANDOFF",
    text: "Organize facility linen and follow the journey of each registered item.",
    tags: ["Hospitals", "Clinics", "Facility linen"],
    accent: "var(--color-sky-blue)",
  },
  {
    icon: WashingMachine,
    name: "Commercial laundries",
    label: "CONNECTED FROM BOTH SIDES",
    text: "Bring client businesses, incoming batches, and returns into one flow.",
    tags: ["Laundry partners", "Batch tracking"],
    accent: "var(--color-aurora-purple)",
  },
];

export default function IndustriesSection() {
  return (
    <section
      className="home-container industries-section"
      aria-labelledby="industries-title"
    >
      <Reveal className="industries-heading">
        <div>
          <p className="home-eyebrow">
            <span className="home-status-dot" /> BUILT FOR THE LINEN ECONOMY
          </p>
          <h2 id="industries-title">
            Different industries.
            <br />
            <span>One connected rhythm.</span>
          </h2>
        </div>
        <p>
          Wherever your linen goes,
          <br />
          Trackly brings the journey together.
        </p>
      </Reveal>
      <div className="industries-grid">
        {industries.map(
          ({ icon: Icon, name, label, text, tags, accent }, index) => (
            <Reveal key={name} delay={index * 0.14} lift>
              <Card
                as="article"
                className="industry-card h-full"
                bodyClassName="industry-card-body h-full"
                padding="clamp(24px, 3vw, 34px)"
                rounded="24px"
                style={{ "--industry-accent": accent }}
              >
                <div className="industry-card-top">
                  <span className="industry-icon">
                    <Icon size={31} strokeWidth={1.5} />
                  </span>
                  <span className="industry-card-number">0{index + 1}</span>
                </div>
                <span className="industry-orbit" aria-hidden="true" />
                <p className="industry-label">{label}</p>
                <h3>{name}</h3>
                <p className="industry-description">{text}</p>
                <div className="industry-tags">
                  {tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </Card>
            </Reveal>
          ),
        )}
      </div>
      <Reveal>
        <div className="industries-connection">
          <span className="home-status-dot" />
          <span>
            From your inventory to your laundry partner. Connected by Trackly.
          </span>
          <ArrowUpRight size={17} aria-hidden="true" />
        </div>
      </Reveal>
    </section>
  );
}
