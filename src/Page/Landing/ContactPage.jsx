import { usePageMeta } from "../../Hooks/usePageMeta";
import ContactSection from "../../Section/landing/Contact";

export default function ContactPage() {
  usePageMeta({ title: "Contact Us - Trackly" });
  return <ContactSection />;
}
