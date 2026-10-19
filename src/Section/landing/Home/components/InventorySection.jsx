import { Boxes, FolderTree, MapPin, Repeat2, Tags, Truck } from "lucide-react";
import Card from "../../../../Components/UI/Card";
import Reveal from "./Reveal";
import PortalPreview from "./PortalPreview";
import { flowSteps } from "../flowSteps";

const capabilities = [
  {
    icon: Boxes,
    title: "One place for every asset",
    text: "Keep your linen and uniforms organized as individual assets with their own identity and history.",
  },
  {
    icon: FolderTree,
    title: "Categories that make sense",
    text: "Group bed linen, towels, uniforms, and other items into the categories your team works with.",
  },
  {
    icon: MapPin,
    title: "Know where items stand",
    text: "Filter assets by category, zone, laundry partner, and status to find what your operation needs.",
  },
  {
    icon: Truck,
    title: "Follow stock movements",
    text: "Track items from your business to the laundry and back through dispatch and return activity.",
  },
  {
    icon: Repeat2,
    title: "See the wash lifecycle",
    text: "Review asset wash counts and tag wash counts to understand how your inventory is being used.",
  },
  {
    icon: Tags,
    title: "Connect tags to assets",
    text: "Bring physical items and their digital records together with tag mapping and traceable item details.",
  },
];

export default function InventorySection() {
  return (
    <section
      id="inventory-management"
      className="home-container home-section"
      aria-labelledby="inventory-title"
    >
      <Reveal className="home-section-heading">
        <div>
          <p className="home-eyebrow">TRACKLY INVENTORY MANAGEMENT</p>
          <h2 id="inventory-title">
            Every item accounted for.
            <br />
            <span>Every movement in view.</span>
          </h2>
        </div>
        <p>
          Manage more than the laundry journey. Give your team an organized view
          of the assets behind your daily operation.
        </p>
      </Reveal>
      <div className="inventory-showcase">
        <Reveal>
          <PortalPreview step={flowSteps[1]} />
        </Reveal>
        <Reveal delay={0.08}>
          <div className="inventory-story">
            <span className="home-icon">
              <Boxes size={27} />
            </span>
            <h3>
              Your inventory has a story.
              <br />
              Trackly keeps it together.
            </h3>
            <p>
              Start with an asset. Add its category, item tag, and location.
              Then follow its dispatches, returns, and wash lifecycle from the
              same connected system.
            </p>
            <div className="inventory-lifecycle">
              <span>Register</span>
              <span>Track</span>
              <span>Return</span>
              <span>Review</span>
            </div>
          </div>
        </Reveal>
      </div>
      <div className="home-feature-grid inventory-capabilities">
        {capabilities.map(({ icon: Icon, title, text }, index) => (
          <Reveal key={title} delay={(index % 3) * 0.05}>
            <Card
              className="h-full"
              bodyClassName="h-full"
              padding="28px"
              rounded="22px"
            >
              <span className="home-icon">
                <Icon size={22} />
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
