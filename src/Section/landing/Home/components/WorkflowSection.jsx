import { ArrowRight, Check, CheckCircle2 } from "lucide-react";
import Badge from "../../../../Components/UI/Badge";
import Reveal from "./Reveal";
import PortalPreview from "./PortalPreview";
import { flowSteps } from "../flowSteps";

export default function WorkflowSection() {
  return (
    <section
      id="how-it-works"
      className="home-workflow home-section"
      aria-labelledby="workflow-title"
    >
      <div className="home-container">
        <Reveal className="home-centered-heading">
          <p className="home-eyebrow">THE TRACKLY JOURNEY, END TO END</p>
          <h2 id="workflow-title">
            From your first connection
            <br />
            to the final check-in.
          </h2>
          <p>
            See how your business and laundry work together, one clear step at a
            time.
          </p>
        </Reveal>
        <div className="flow-summary" aria-label="Workflow sequence">
          {[
            "Connect",
            "Register",
            "Dispatch",
            "Receive",
            "Return",
            "Reconcile",
          ].map((label, index) => (
            <span key={label}>
              <b>{String(index + 1).padStart(2, "0")}</b>
              {label}
              {index < 5 && <ArrowRight size={13} aria-hidden="true" />}
            </span>
          ))}
        </div>
        <ol className="flow-steps">
          {flowSteps.map((step, index) => (
            <li key={step.id} className="flow-step">
              <Reveal className="flow-step-copy">
                <div className="flow-step-top">
                  <span className="flow-step-index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <Badge
                    variant={
                      step.portal === "Laundry portal" ? "info" : "ready"
                    }
                    size="sm"
                  >
                    {step.portal}
                  </Badge>
                </div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
                <ul className="flow-step-checklist">
                  {step.points.map((point) => (
                    <li key={point}>
                      <Check size={16} aria-hidden="true" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                <div className="flow-step-outcome">
                  <CheckCircle2 size={18} aria-hidden="true" />
                  <span>{step.outcome}</span>
                </div>
              </Reveal>
              <Reveal className="flow-step-visual" delay={0.08}>
                <PortalPreview
                  step={step}
                  screenshot={step.screenshot}
                  screenshotAlt={step.screenshotAlt}
                />
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
