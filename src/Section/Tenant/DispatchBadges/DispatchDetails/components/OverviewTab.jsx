import {
  Activity,
  Building2,
  FileText,
  Folder,
  Info,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import Alert from "../../../../../Components/UI/Alert";
import Badge from "../../../../../Components/UI/Badge";
import Card from "../../../../../Components/UI/Card";
import IconWrapper from "../../../../../Components/UI/IconWrapper";
import ProgressBar from "../../../../../Components/UI/ProgressBar";

const OverviewTab = ({ details }) => {
  const categoryBreakdown = details?.categoryBreakdown || [];
  const partner = details?.laundryPartner || {};
  const latestActivity = details?.latestActivity || [];
  const totalItems = details?.summary?.totalItems || 0;

  return (
    <div className="space-y-6 pt-4">
      {/* 3 Column Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Category Breakdown */}
        <Card padding="20px 22px" rounded="20px">
          <div className="flex items-center gap-2.5 mb-5">
            <IconWrapper
              icon={Folder}
              variant="teal"
              sizeClassName="h-8 w-8"
              iconSize={16}
              roundedClassName="rounded-lg"
            />
            <h3 className="text-base font-bold text-(--theme-text-primary)">
              Category Breakdown
            </h3>
          </div>

          <div className="space-y-4">
            {categoryBreakdown.map((item) => (
              <div key={item.category} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-(--theme-text-primary)">
                    {item.category}
                  </span>
                  <span className="text-(--theme-text-secondary)">
                    {item.count} items
                  </span>
                </div>
                <ProgressBar
                  value={item.count}
                  max={totalItems}
                  variant={item.variant || "teal"}
                  heightClass="h-2"
                />
              </div>
            ))}

            <div className="pt-3 border-t border-(--theme-border) flex items-center justify-between text-sm font-bold">
              <span className="text-(--theme-text-secondary)">Total</span>
              <span className="text-(--theme-text-primary)">
                {totalItems} items
              </span>
            </div>
          </div>
        </Card>

        {/* Card 2: Laundry Partner */}
        <Card padding="20px 22px" rounded="20px">
          <div className="flex items-center gap-2.5 mb-4">
            <IconWrapper
              icon={Building2}
              variant="purple"
              sizeClassName="h-8 w-8"
              iconSize={16}
              roundedClassName="rounded-lg"
            />
            <h3 className="text-base font-bold text-(--theme-text-primary)">
              Laundry Partner
            </h3>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-(--theme-surface-strong) border border-(--theme-border) mb-4">
            <IconWrapper
              icon={Building2}
              variant="purple"
              sizeClassName="h-9 w-9"
              iconSize={18}
              roundedClassName="rounded-lg"
            />
            <div>
              <div className="text-sm font-bold text-(--theme-text-primary)">
                {partner.name}
              </div>
              <Badge variant="ready" size="sm" dot>
                {partner.status}
              </Badge>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center gap-2.5">
              <User size={15} className="text-(--theme-text-secondary) shrink-0" />
              <span className="text-(--theme-text-secondary) w-16">Contact</span>
              <span className="font-semibold text-(--theme-text-primary)">
                {partner.contact}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone size={15} className="text-(--theme-text-secondary) shrink-0" />
              <span className="text-(--theme-text-secondary) w-16">Phone</span>
              <span className="font-semibold text-(--theme-text-primary)">
                {partner.phone}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail size={15} className="text-(--theme-text-secondary) shrink-0" />
              <span className="text-(--theme-text-secondary) w-16">Email</span>
              <span className="font-semibold text-(--theme-text-primary)">
                {partner.email}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <MapPin size={15} className="text-(--theme-text-secondary) shrink-0" />
              <span className="text-(--theme-text-secondary) w-16">Location</span>
              <span className="font-semibold text-(--theme-text-primary)">
                {partner.location}
              </span>
            </div>
          </div>
        </Card>

        {/* Column 3: Dispatch Notes & Latest Activity */}
        <div className="space-y-5">
          {/* Dispatch Notes */}
          <Card padding="20px 22px" rounded="20px">
            <div className="flex items-center gap-2.5 mb-3">
              <IconWrapper
                icon={FileText}
                variant="info"
                sizeClassName="h-8 w-8"
                iconSize={16}
                roundedClassName="rounded-lg"
              />
              <h3 className="text-base font-bold text-(--theme-text-primary)">
                Dispatch Notes
              </h3>
            </div>

            <div className="p-3.5 rounded-xl bg-(--theme-surface-strong) border border-(--theme-border) italic text-xs text-(--theme-text-secondary) leading-relaxed">
              "{details.notes}"
            </div>
          </Card>

          {/* Latest Activity */}
          <Card padding="20px 22px" rounded="20px">
            <div className="flex items-center gap-2.5 mb-3">
              <IconWrapper
                icon={Activity}
                variant="teal"
                sizeClassName="h-8 w-8"
                iconSize={16}
                roundedClassName="rounded-lg"
              />
              <h3 className="text-base font-bold text-(--theme-text-primary)">
                Latest Activity
              </h3>
            </div>

            <div className="space-y-3 pt-1">
              {latestActivity.map((act) => (
                <div key={act.id} className="flex items-start gap-2.5">
                  <div className="h-2 w-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-(--theme-text-primary)">
                      {act.title}
                    </div>
                    <div className="text-[11px] font-medium text-(--theme-text-secondary)">
                      {act.meta}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Global Alert Banner */}
      <Alert
        variant="info"
        size="md"
        rounded="rounded-2xl"
        leftIcon={<Info size={18} className="text-blue-500" />}
      >
        <span className="text-xs sm:text-sm font-medium">
          The batch contains only valid existing tags linked with assets. New
          unlinked tags remain separate until they are registered and linked with an
          asset.
        </span>
      </Alert>
    </div>
  );
};

export default OverviewTab;
