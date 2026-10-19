import {
  ArrowRight,
  Building2,
  Mail,
  Send,
  WashingMachine,
} from "lucide-react";
import { Link } from "react-router-dom";
import Card from "../../../Components/UI/Card";
import Button from "../../../Components/UI/Button";
import ContactForm from "./ContactForm";
import { SUPPORT_EMAIL } from "../../../Config/contact";

export default function ContactSection() {
  return (
    <section
      className="px-2 py-8 md:px-6 md:py-14"
      aria-labelledby="contact-title"
    >
      <div className="mb-12 max-w-2xl">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-(--color-aurora-teal)">
          <Mail size={16} /> We’re here to help
        </p>
        <h1
          id="contact-title"
          className="mt-5 text-4xl font-bold tracking-tight text-(--theme-text-primary) md:text-6xl"
        >
          Let’s get your
          <br />
          <span className="text-(--color-aurora-teal)">operation in sync.</span>
        </h1>
        <p className="mt-5 text-base leading-8 text-(--theme-text-secondary)">
          Have a question about Trackly, asset tracking, or connecting your
          laundry partners? Tell us a little about your business and what you
          need.
        </p>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-6">
          <Card padding="28px" rounded="22px">
            <Mail size={25} className="text-(--color-aurora-teal)" />
            <h2 className="mt-5 text-xl font-bold text-(--theme-text-primary)">
              A conversation starts here.
            </h2>
            <p className="mt-3 text-sm leading-7 text-(--theme-text-secondary)">
              {SUPPORT_EMAIL ? "For product questions, onboarding, and support, reach us by email." : "Explore the business and laundry workspaces below to get started with Trackly."}
            </p>
            {SUPPORT_EMAIL && <a
              className="mt-5 block break-all font-semibold text-(--color-aurora-teal) hover:underline"
              href={`mailto:${SUPPORT_EMAIL}`}
            >
              {SUPPORT_EMAIL}
            </a>}
          </Card>
          <Card padding="28px" rounded="22px">
            <h2 className="text-lg font-bold text-(--theme-text-primary)">
              Ready to get started?
            </h2>
            <p className="my-4 text-sm leading-7 text-(--theme-text-secondary)">
              Choose the workspace that fits your operation.
            </p>
            <div className="flex flex-col gap-3">
              <Button
                as={Link}
                to="/business/signup"
                variant="secondary"
                leftIcon={<Building2 size={17} />}
                rightIcon={<ArrowRight size={15} />}
              >
                For businesses
              </Button>
              <Button
                as={Link}
                to="/laundry/signup"
                variant="outline"
                leftIcon={<WashingMachine size={17} />}
                rightIcon={<ArrowRight size={15} />}
              >
                For laundries
              </Button>
            </div>
          </Card>
        </div>
        <Card padding="clamp(24px, 4vw, 40px)" rounded="24px">
          <div className="mb-7">
            <Send size={25} className="text-(--color-aurora-teal)" />
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-(--theme-text-primary)">
              Tell us how we can help.
            </h2>
            <p className="mt-3 text-sm leading-7 text-(--theme-text-secondary)">
              {SUPPORT_EMAIL ? "Fill in your details to prepare an email. Your email app will open so you can review and send it." : "Email contact is currently unavailable."}
            </p>
          </div>
          <ContactForm />
        </Card>
      </div>
    </section>
  );
}
