import {
  LayoutDashboard,
  Users,
  CreditCard,
  ShieldCheck,
  Megaphone,
  LayoutGrid,
  FileText,
  Shield,
  MessageCircle,
  Settings,
  AlertTriangle,
  MapPin,
  MessageSquare,
  ExternalLink,
  Calendar,
  DollarSign,
  Tag,
  BookOpen,
  Home,
  Building2,
  TowelRack,
  ChartColumnStacked,
  Tags,
  ChartCandlestick,
  ScanQrCode,
  SwatchBook,
  ShelvingUnit,
  ChartNoAxesCombined,
  ShieldAlert,
  UsersRound,
  UserRoundKey,
} from "lucide-react";

export const NAV_MENU = [
  { id: 1, name: "Home", href: "/" },
  { id: 2, name: "Browse Tutors", href: "/browse-tutors" },
  { id: 4, name: "About Us", href: "/about" },
  { id: 5, name: "FAQ's", href: "/faq" },
];

export const NAV = {
  superadmin: [
    {
      id: 1,
      label: "Dashboard",
      href: "/superadmin/dashboard",
      Icon: LayoutGrid,
    },
    {
      id: 2,
      label: "Businesses",
      href: "/superadmin/businesses",
      Icon: Building2,
    },
    {
      id: 3,
      label: "Bookings",
      href: "/superadmin/bookings",
      Icon: Calendar,
    },
    {
      items: [
        { id: 4, label: "Users", href: "/superadmin/users", Icon: Users },
        {
          id: 6,
          label: "Payment",
          href: "/superadmin/payment-billings",
          Icon: DollarSign,
        },
        {
          id: 7,
          label: "Compliance Overview",
          href: "/superadmin/compliance",
          Icon: Shield,
        },
        {
          id: 8,
          label: "Businesses Verification",
          href: "/superadmin/verification",
          Icon: ShieldCheck,
        },
        {
          id: 9,
          label: "Subscriptions & Promotions",
          href: "/superadmin/promotions",
          Icon: Tag,
        },
        {
          id: 10,
          label: "Violations",
          href: "/superadmin/violations",
          Icon: AlertTriangle,
        },
      ],
    },
    {
      items: [
        {
          id: 11,
          label: "Chat Support",
          href: "/superadmin/chat-support",
          Icon: MessageCircle,
        },
        {
          id: 12,
          label: "Platform Announcements",
          href: "/superadmin/announcements",
          Icon: Megaphone,
        },
      ],
    },
    {
      items: [
        {
          id: 13,
          label: "Reports & Analytics",
          href: "/superadmin/analytics",
          Icon: FileText,
        },
      ],
    },
    {
      items: [
        {
          id: 14,
          label: "Resource Hub",
          href: "/superadmin/resource-hub",
          Icon: BookOpen,
        },
        {
          id: 15,
          label: "Settings",
          href: "/superadmin/settings",
          Icon: Settings,
        },
        {
          id: 16,
          label: "Landing Page Management",
          href: "/superadmin/landing-page",
          Icon: Home,
        },
      ],
    },
  ],
  business: [
    {
      id: 100,
      label: "Dashboard",
      href: "/business/dashboard",
      Icon: LayoutDashboard,
    },
    {
      id: 101,
      label: "Linked Laundries",
      href: "/business/linked-laundries",
      Icon: TowelRack,
    },
    {
      id: 102,
      label: "Categories",
      href: "/business/categories",
      Icon: ChartColumnStacked,
    },
    {
      id: 103,
      label: "Tags",
      href: "/business/tags",
      Icon: Tags,
    },
    {
      id: 105,
      label: "Assets",
      href: "/business/assets",
      Icon: ChartCandlestick,
    },
    {
      id: 106,
      label: "Scanners",
      href: "/business/scanners",
      Icon: ScanQrCode,
    },
    {
      id: 112,
      label: "Staff",
      href: "/business/staff",
      Icon: UsersRound,
    },
    {
      id: 113,
      label: "Staff Roles",
      href: "/business/staff-roles",
      Icon: UserRoundKey,
    },
    {
      id: 107,
      label: "Dispatch Batches",
      href: "/business/dispatch-batches",
      Icon: SwatchBook,
    },
    {
      id: 108,
      label: "Inventory",
      href: "/business/inventory",
      Icon: ShelvingUnit,
    },
    {
      id: 109,
      label: "Reports & Analytics",
      href: "/business/analytics",
      Icon: ChartNoAxesCombined,
    },
    {
      id: 110,
      label: "Exceptions",
      href: "/business/exceptions",
      Icon: ShieldAlert,
    },
    {
      id: 111,
      label: "Settings",
      href: "/business/settings",
      Icon: Settings,
    },
   
  ],
  laundry: [
    {
      id: 200,
      label: "Dashboard",
      href: "/laundry/dashboard",
      Icon: LayoutDashboard,
    },
    {
      id: 201,
      label: "Spaces",
      href: "/laundry/spaces",
      Icon: MapPin,
    },
    {
      id: 202,
      label: "Bookings",
      href: "/laundry/bookings",
      Icon: Calendar,
    },
    {
      id: 203,
      label: "Billing & Package",
      href: "/laundry/packages",
      Icon: CreditCard,
    },
    {
      id: 204,
      label: "Compliance Overview",
      href: "/laundry/compliance",
      Icon: Shield,
    },
    {
      id: 205,
      label: "Violations",
      href: "/laundry/violations",
      Icon: AlertTriangle,
    },
    {
      id: 208,
      label: "Messages",
      href: "/laundry/messaging",
      Icon: MessageCircle,
    },
    {
      id: 209,
      label: "Community Board",
      href: "/laundry/community-board",
      Icon: MessageSquare,
    },
    {
      id: 210,
      label: "Platform Announcements",
      href: "/laundry/announcements",
      Icon: Megaphone,
    },
    {
      id: 211,
      label: "Resource Hub",
      href: "/laundry/resource-hub",
      Icon: ExternalLink,
    },
  ],
};

export const HEADER_NAV = {
  default: [
    { id: 1, name: "About Us", href: "/about" },
    { id: 2, name: "Contact Us", href: "/contact" },
  ],
};

// ============================================================================
// PORTAL GROUPS & HELPERS
// ============================================================================

export const portalGroups = [
  {
    key: "superadmin",
    label: "Super Admin",
    shortLabel: "SA",
    basePath: "/superadmin",
    enabled: true,
    icon: ShieldCheck,
    accent: "#10B981",
    user: { name: "Platform Admin", email: "admin@platform.com" },
  },
  {
    key: "business",
    label: "Business Portal",
    shortLabel: "BP",
    basePath: "/business",
    enabled: true,
    icon: Building2,
    accent: "#3B82F6",
    user: { name: "Business Owner", email: "business@platform.com" },
  },
  {
    key: "laundry",
    label: "Laundry Portal",
    shortLabel: "LP",
    basePath: "/laundry",
    enabled: true,
    icon: Users,
    accent: "#8B5CF6",
    user: { name: "Laundry User", email: "laundry@platform.com" },
  },
];

/**
 * Get all flattened menu items for a portal
 */
export const getFlatPortalItems = (portalKey) => {
  const portalNav = NAV[portalKey] || [];
  const items = [];

  portalNav.forEach((sectionOrItem) => {
    if (Array.isArray(sectionOrItem.items)) {
      sectionOrItem.items?.forEach((item) => {
        items.push({
          ...item,
          segment: item.href.split("/").filter(Boolean).at(-1),
        });
      });
    } else {
      items.push({
        ...sectionOrItem,
        segment: sectionOrItem.href.split("/").filter(Boolean).at(-1),
      });
    }
  });

  return items;
};
