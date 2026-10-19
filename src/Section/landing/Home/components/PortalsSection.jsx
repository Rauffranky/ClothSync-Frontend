import { ArrowRight, Building2, WashingMachine } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../../../../Components/UI/Button";
import Card from "../../../../Components/UI/Card";
import Reveal from "./Reveal";

const portals = [
  {
    icon: Building2,
    name: "For businesses",
    text: "Take control of your linen inventory, connect your laundry partners, and follow every dispatch.",
    signup: "/business/signup",
    login: "/business/login",
    action: "Create a business account",
  },
  {
    icon: WashingMachine,
    name: "For laundries",
    text: "Connect with client businesses, track incoming batches, and keep the return journey organized.",
    signup: "/laundry/signup",
    login: "/laundry/login",
    action: "Create a laundry account",
  },
];

export default function PortalsSection() {
  return (
    <section
      id="portals"
      className="home-container home-section"
      aria-labelledby="portals-title"
    >
      <Reveal>
        <div className="home-centered-heading">
          <p className="home-eyebrow">TWO SIDES. ONE CONNECTED SYSTEM.</p>
          <h2 id="portals-title">Your next chapter starts in sync.</h2>
          <p>Choose your workspace and bring your operation together.</p>
        </div>
        <div className="home-portal-grid">
          {portals.map(({ icon: Icon, name, text, signup, login, action }) => (
            <Card key={name} padding="clamp(24px, 4vw, 44px)" rounded="24px">
              <span className="home-icon">
                <Icon size={25} />
              </span>
              <h3>{name}</h3>
              <p>{text}</p>
              <Button
                as={Link}
                to={signup}
                rightIcon={<ArrowRight size={17} />}
              >
                {action}
              </Button>
              <Link className="home-login-link" to={login}>
                Already connected? Log in <ArrowRight size={14} />
              </Link>
            </Card>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
