import { Building2 } from "lucide-react";

const BusinessSelector = ({ collapsed = false, className = "" }) => {
  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1C2534] border border-[#2D3E4F] ${className}`}
    >
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#10B981]/20">
        <Building2 size={16} className="text-[#10B981]" />
      </div>

      {!collapsed && (
        <div className="min-w-0">
          <div className="text-xs font-semibold text-[#10B981]">Business</div>
          <div className="text-[10px] text-[#8E9EAF] truncate">
            Select Business
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessSelector;
