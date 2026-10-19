import { Boxes, Radio, Repeat2, ShieldCheck, Truck, Users } from "lucide-react";
import Card from "../../../../Components/UI/Card";
import Reveal from "./Reveal";

const features = [
  {
    icon: Radio,
    title: "Scan more. Type less.",
    text: "Identify tagged items in bulk with connected scanners and follow scan activity as it happens.",
  },
  {
    icon: Boxes,
    title: "Know your inventory.",
    text: "Organize assets, tags, and categories so your team can find and follow every item.",
  },
  {
    icon: Truck,
    title: "Close the loop.",
    text: "Follow dispatch batches between your business and laundry, from check-out through receipt and return.",
  },
  {
    icon: Repeat2,
    title: "Make every wash count.",
    text: "Keep asset and tag wash cycles visible throughout the linen lifecycle.",
  },
  {
    icon: Users,
    title: "Work as one team.",
    text: "Connect partner businesses and laundries, with dedicated portals for each side of the operation.",
  },
  {
    icon: ShieldCheck,
    title: "Give the right access.",
    text: "Organize staff and custom roles around the responsibilities of your operation.",
  },
];

export default function FeaturesSection() {
  return (
    <section
      id="features"
      className="home-container home-section"
      aria-labelledby="features-title"
    >
      <Reveal className="home-section-heading">
        <div>
          <p className="home-eyebrow">LESS GUESSWORK. MORE CLARITY.</p>
          <h2 id="features-title">
            Your entire operation.
            <br />
            <span>Beautifully connected.</span>
          </h2>
        </div>
        <p>
          Keep the details in view and your day moving. The tools your linen
          operation needs, together in one place.
        </p>
      </Reveal>
      <div className="home-feature-grid">
        {features.map(({ icon: Icon, title, text }, i) => (
          <Reveal key={title} delay={(i % 3) * 0.06}>
            <Card
              className="h-full"
              bodyClassName="h-full"
              padding="30px"
              rounded="22px"
            >
              <span className="home-icon">
                <Icon size={23} />
              </span>
              <h3>{title}</h3>
              <p>{text}</p>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
