import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

const Modal = ({
  open = false,
  onClose,
  title,
  description,
  children,
  footer,
  width = 550,
  closeOnBackdrop = true,
  showCloseButton = true,
}) => {
  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  if (!open) return null;

  const modal = (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center px-4 py-6"
      role="presentation"
    >
      <button
        aria-label="Close modal"
        className=" absolute inset-0 border-0 bg-black/55 backdrop-blur-[3px]"
        onClick={closeOnBackdrop ? onClose : undefined}
        type="button"
      />

      <section
        aria-modal="true"
        className="relative flex max-h-[calc(100vh-48px)] w-full flex-col overflow-hidden rounded-[22px] border shadow-[0_28px_90px_rgba(0,0,0,0.38)]"
        role="dialog"
        style={{
          maxWidth: width,
          background:
            "linear-gradient(145deg, var(--theme-surface-strong), var(--theme-surface))",
          borderColor: "var(--theme-border)",
          color: "var(--theme-text-primary)",
        }}
      >
        {(title || description || showCloseButton) && (
          <header className="flex items-start justify-between gap-5 px-6 py-4">
            <div className="min-w-0">
              {title && (
                <h2 className="m-0 text-xl font-bold leading-tight">
                  {title}
                </h2>
              )}
              {description && (
                <p className="m-0 mt-2 max-w-xl text-sm font-medium leading-relaxed text-(--theme-text-muted)">
                  {description}
                </p>
              )}
            </div>

            {showCloseButton && (
              <button
                aria-label="Close"
                className="cursor-pointer grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-transparent bg-transparent text-(--theme-text-muted) transition hover:border-(--theme-border) hover:bg-(--theme-surface-hover) hover:text-(--theme-text-primary)"
                onClick={onClose}
                type="button"
              >
                <X size={22} />
              </button>
            )}
          </header>
        )}

        <div className="flex-1 overflow-y-auto border-t border-(--theme-border) px-6 py-4">
          {children}
        </div>

        {footer && (
          <footer className="flex flex-col-reverse gap-3 border-t border-(--theme-border) px-6 py-4 sm:flex-row sm:justify-end ">
            {footer}
          </footer>
        )}
      </section>
    </div>
  );

  return createPortal(modal, document.body);
};

export default Modal;
