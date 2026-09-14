import { useEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

const DEFAULT_TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, 4, false] }],
  ["bold", "italic", "underline", "strike"],
  [{ color: [] }, { background: [] }],
  [{ list: "ordered" }, { list: "bullet" }],
  [{ align: [] }],
  ["blockquote", "code-block"],
  ["link", "clean"],
];

const QuillEditor = ({
  value = "",
  onChange,
  placeholder = "Write terms and conditions content here...",
  readOnly = false,
  minHeight = "360px",
  className = "",
  dir = "ltr",
  onInsertCta,
}) => {
  const containerRef = useRef(null);
  const quillRef = useRef(null);
  const isUpdatingRef = useRef(false);

  useEffect(() => {
    const wrapper = containerRef.current;
    if (!wrapper) return;

    // Clean any prior children before mounting
    wrapper.innerHTML = "";

    // Create an isolated host container that will hold both Quill's toolbar and editor
    const host = document.createElement("div");
    wrapper.appendChild(host);

    const editorMount = document.createElement("div");
    host.appendChild(editorMount);

    const toolbarConfig = onInsertCta
      ? {
          container: [
            [{ header: [1, 2, 3, 4, false] }],
            ["bold", "italic", "underline", "strike"],
            [{ color: [] }, { background: [] }],
            [{ list: "ordered" }, { list: "bullet" }],
            [{ align: [] }],
            ["blockquote", "code-block"],
            ["link", "ctaButton", "clean"],
          ],
          handlers: {
            ctaButton: () => {
              onInsertCta();
            },
          },
        }
      : DEFAULT_TOOLBAR_OPTIONS;

    const quill = new Quill(editorMount, {
      theme: "snow",
      readOnly,
      placeholder,
      modules: {
        toolbar: readOnly ? false : toolbarConfig,
      },
    });

    // Populate custom CTA toolbar button visual icon/label
    if (onInsertCta) {
      const ctaBtn = host.querySelector(".ql-ctaButton");
      if (ctaBtn) {
        ctaBtn.innerHTML = `<span style="display:inline-flex;align-items:center;gap:4px;font-size:11.5px;font-weight:600;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="12" rx="3"></rect><path d="m10 12 2 2 3-3"></path></svg>+ Button</span>`;
        ctaBtn.setAttribute("title", "Insert Call to Action (CTA) Button");
        ctaBtn.setAttribute("type", "button");
      }
    }

    quillRef.current = quill;
    quill.root.setAttribute("dir", dir);

    if (value) {
      quill.root.innerHTML = value;
    }

    quill.on("text-change", () => {
      if (isUpdatingRef.current) return;
      const html = quill.root.innerHTML;
      const isEmpty = html === "<p><br></p>" || html.trim() === "";
      onChange?.(isEmpty ? "" : html);
    });

    return () => {
      quill.off("text-change");
      quillRef.current = null;
      wrapper.innerHTML = "";
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync readOnly changes
  useEffect(() => {
    if (quillRef.current) {
      quillRef.current.enable(!readOnly);
    }
  }, [readOnly]);

  // Sync dir changes (LTR / RTL)
  useEffect(() => {
    if (quillRef.current) {
      quillRef.current.root.setAttribute("dir", dir);
    }
  }, [dir]);

  // Sync external value changes (e.g. Reset Default button)
  useEffect(() => {
    if (!quillRef.current) return;
    const currentHtml = quillRef.current.root.innerHTML;
    const normalizedCurrent = currentHtml === "<p><br></p>" ? "" : currentHtml;
    const normalizedValue = value === "<p><br></p>" ? "" : value;

    if (normalizedValue !== normalizedCurrent) {
      isUpdatingRef.current = true;
      quillRef.current.root.innerHTML = normalizedValue || "";
      isUpdatingRef.current = false;
    }
  }, [value]);

  return (
    <div
      className={`quill-wrapper overflow-hidden rounded-2xl border transition-all ${className}`}
      style={{
        borderColor: "var(--theme-border)",
        background: "var(--theme-surface)",
      }}
    >
      <style>{`
        .quill-wrapper .ql-toolbar.ql-snow {
          border: none !important;
          border-bottom: 1px solid var(--theme-border) !important;
          background: var(--theme-surface-hover, rgba(0,0,0,0.02));
          padding: 10px 14px;
          display: flex;
          flex-wrap: wrap;
          gap: 2px;
          border-top-left-radius: 1rem;
          border-top-right-radius: 1rem;
        }
        .quill-wrapper .ql-container.ql-snow {
          border: none !important;
          font-family: inherit !important;
          font-size: 14.5px;
          line-height: 1.7;
          color: var(--theme-text-primary);
        }
        .quill-wrapper .ql-editor {
          min-height: ${minHeight};
          padding: 18px 22px;
          color: var(--theme-text-primary);
        }
        .quill-wrapper .ql-editor[dir="rtl"] {
          text-align: right;
          direction: rtl;
        }
        .quill-wrapper .ql-editor[dir="rtl"].ql-blank::before {
          left: auto;
          right: 22px;
        }
        .quill-wrapper .ql-editor a[style*="background"] {
          display: inline-block !important;
          text-decoration: none !important;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(20, 184, 166, 0.28);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .quill-wrapper .ql-editor a[style*="background"]:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(20, 184, 166, 0.38);
        }
        .quill-wrapper .ql-editor.ql-blank::before {
          color: var(--theme-text-muted);
          font-style: normal;
          left: 22px;
        }
        .quill-wrapper .ql-snow .ql-ctaButton {
          width: auto !important;
          padding: 2px 8px !important;
          border-radius: 6px !important;
          background: rgba(20, 184, 166, 0.08) !important;
          color: var(--color-aurora-teal, #0d9488) !important;
          border: 1px solid rgba(20, 184, 166, 0.25) !important;
          transition: all 0.15s ease !important;
        }
        .quill-wrapper .ql-snow .ql-ctaButton:hover {
          background: var(--color-aurora-teal, #0d9488) !important;
          color: #ffffff !important;
          border-color: var(--color-aurora-teal, #0d9488) !important;
        }
        .quill-wrapper .ql-snow .ql-ctaButton:hover svg {
          stroke: #ffffff !important;
        }
        .quill-wrapper .ql-snow .ql-stroke {
          stroke: var(--theme-text-secondary);
        }
        .quill-wrapper .ql-snow .ql-fill {
          fill: var(--theme-text-secondary);
        }
        .quill-wrapper .ql-snow .ql-picker {
          color: var(--theme-text-secondary);
        }
        .quill-wrapper .ql-snow .ql-picker-options {
          background-color: var(--theme-surface);
          border: 1px solid var(--theme-border);
          border-radius: 8px;
          padding: 6px;
        }
        .quill-wrapper .ql-snow .ql-picker-item {
          color: var(--theme-text-primary);
        }
        .quill-wrapper .ql-snow.ql-toolbar button:hover,
        .quill-wrapper .ql-snow .ql-toolbar button:focus,
        .quill-wrapper .ql-snow.ql-toolbar .ql-picker-label:hover {
          color: var(--color-aurora-teal);
        }
        .quill-wrapper .ql-snow.ql-toolbar button:hover .ql-stroke,
        .quill-wrapper .ql-snow .ql-toolbar button:focus .ql-stroke,
        .quill-wrapper .ql-snow.ql-toolbar .ql-picker-label:hover .ql-stroke {
          stroke: var(--color-aurora-teal);
        }
        .quill-wrapper .ql-snow.ql-toolbar button.ql-active .ql-stroke,
        .quill-wrapper .ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-stroke {
          stroke: var(--color-aurora-teal);
        }
        .quill-wrapper .ql-snow.ql-toolbar button.ql-active .ql-fill {
          fill: var(--color-aurora-teal);
        }
      `}</style>
      <div ref={containerRef} />
    </div>
  );
};

export default QuillEditor;
