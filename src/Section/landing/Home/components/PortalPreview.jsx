import { useState } from "react";
import {
  Building2,
  CheckCircle2,
  LayoutDashboard,
  Package,
  ScanLine,
  Truck,
} from "lucide-react";
import Badge from "../../../../Components/UI/Badge";

const previewNavigation = [LayoutDashboard, Package, ScanLine, Truck];

export default function PortalPreview({ step, screenshot, screenshotAlt }) {
  const [failedSource, setFailedSource] = useState(null);
  const showScreenshot = screenshot && failedSource !== screenshot;

  return (
    <figure className="flow-preview">
      <div className="flow-preview-chrome">
        <span className="flow-window-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span>Trackly / {step.portal}</span>
        <span className="flow-preview-label">
          {showScreenshot ? "Portal screenshot" : "Illustrative preview"}
        </span>
      </div>
      {showScreenshot ? (
        <img
          className="flow-screenshot"
          src={screenshot}
          alt={screenshotAlt || `${step.portal}: ${step.screen}`}
          loading="lazy"
          decoding="async"
          onError={() => setFailedSource(screenshot)}
        />
      ) : (
        <div className="flow-preview-app">
          <div className="flow-preview-sidebar" aria-hidden="true">
            <span className="flow-preview-brand">T</span>
            {previewNavigation.map((Icon, index) => (
              <span
                className={index === 1 ? "flow-preview-nav-active" : ""}
                key={index}
              >
                <Icon size={17} />
              </span>
            ))}
          </div>
          <div className="flow-preview-content">
            <div className="flow-preview-heading">
              <div>
                <span className="flow-preview-overline">{step.portal}</span>
                <h4>{step.screen}</h4>
              </div>
              <Building2 size={21} aria-hidden="true" />
            </div>
            <div className="flow-preview-metric">
              <div>
                <span>{step.metric}</span>
                <strong>{step.value}</strong>
              </div>
              <CheckCircle2 size={26} aria-hidden="true" />
            </div>
            <div className="flow-preview-table-wrap">
              <table>
                <caption className="sr-only">
                  Illustrative example for {step.screen}; sample data
                </caption>
                <thead>
                  <tr>
                    {step.columns.map((column) => (
                      <th key={column} scope="col">
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {step.rows.map((row) => (
                    <tr key={row[0]}>
                      {row.map((value, index) => (
                        <td key={step.columns[index]}>
                          {index === 2 ? (
                            <Badge
                              size="sm"
                              variant={
                                value === "Pending" ? "pending" : "ready"
                              }
                            >
                              {value}
                            </Badge>
                          ) : (
                            value
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flow-preview-bottom">
              <span className="home-status-dot" />
              <span>Connected operations, one shared journey.</span>
            </div>
          </div>
        </div>
      )}
      <figcaption>
        {showScreenshot
          ? step.screen
          : `${step.screen} · Example data for illustration`}
      </figcaption>
    </figure>
  );
}
