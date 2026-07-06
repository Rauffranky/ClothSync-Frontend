import { useEffect } from "react";
import { X } from "lucide-react";

const SlideOver = ({ isOpen, onClose, direction = "right", children, headerContent, className = "" }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const getTranslateClass = () => {
    if (!isOpen) {
      switch (direction) {
        case "left": return "-translate-x-full";
        case "right": return "translate-x-full";
        case "top": return "-translate-y-full";
        case "bottom": return "translate-y-full";
        default: return "translate-x-full";
      }
    }
    return "translate-x-0 translate-y-0";
  };

  const getPositionClass = () => {
    switch (direction) {
      case "left": return "top-0 left-0 h-full w-[85%] max-w-sm rounded-r-[22px]";
      case "right": return "top-0 right-0 h-full w-[85%] max-w-sm rounded-l-[22px]";
      case "top": return "top-0 left-0 w-full h-[60vh] rounded-b-[32px]";
      case "bottom": return "bottom-0 left-0 w-full h-[85vh] rounded-t-[32px]";
      default: return "top-0 right-0 h-full w-[85%] max-w-sm rounded-l-[22px]";
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* SlideOver Panel */}
      <div
        className={`fixed z-[100] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] overflow-hidden ${getPositionClass()} ${getTranslateClass()} ${className}`}
      >
        <div className="h-full w-full bg-white/95 dark:bg-[image:var(--layout-header-bg)] backdrop-blur-[18px] backdrop-saturate-150 border border-(--theme-border) shadow-(--layout-panel-shadow) flex flex-col p-5">
          <div className="flex justify-between items-center mb-6">
            {headerContent ? headerContent : <div></div>}
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-(--button-secondary-bg) border border-(--button-secondary-border) text-(--theme-text-primary) hover:bg-[rgba(20,184,166,0.12)] transition-colors"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto hide-scrollbar flex flex-col gap-4">
            {children}
          </div>
        </div>
      </div>
    </>
  );
};

export default SlideOver;
