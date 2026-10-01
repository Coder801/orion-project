import {
    BadgeCheckIcon,
    BookOpenIcon,
    ChartCandlestickIcon,
    CoinsIcon,
    CreditCardIcon,
    GlobeIcon,
    MailIcon,
    MessageCircleIcon,
    ShieldCheckIcon,
    WalletIcon,
    ZapIcon,
    type LucideIcon,
} from "lucide-react";

// The landing page is rendered from this array, in order. All copy comes from
// `landing.<section>.*` i18n keys; partner banks are fictional and license
// cards carry generic compliance copy — no real company names, licence numbers
// or figures.

export type LicenseState = "active" | "inProgress" | "planned";

export type LicenseKey = "banking" | "amlKyc" | "clientProtection";

export type LandingSection =
    | { type: "hero"; id: "hero" }
    | {
          type: "about";
          id: "about";
          tabs: { key: AboutTab; icon: LucideIcon }[];
      }
    | {
          type: "services";
          id: "services";
          items: { key: ServiceKey; icon: LucideIcon }[];
      }
    | {
          type: "partners";
          id: "partners";
          items: { key: PartnerKey; tone: PartnerTone }[];
      }
    | {
          type: "license";
          id: "license";
          items: { key: LicenseKey; state: LicenseState }[];
      }
    | {
          type: "support";
          id: "support";
          channels: { key: SupportChannel; icon: LucideIcon }[];
          faq: FaqKey[];
      }
    | { type: "contact"; id: "contact" }
    | { type: "footer"; id: "footer" };

export type AboutTab = "convenience" | "cryptoTopUp" | "accessibility";

export type ServiceKey =
    | "multiCurrency"
    | "instantTransfers"
    | "security"
    | "cards"
    | "liveRates"
    | "compliance";

export type PartnerKey =
    | "northgate"
    | "alderBay"
    | "halvorsen"
    | "lumenTrust"
    | "crestline"
    | "veridia"
    | "brightwater"
    | "rhineMeridian"
    | "summitRidge"
    | "solent"
    | "cascadia"
    | "aurelius";

export type PartnerTone =
    | "sky"
    | "emerald"
    | "amber"
    | "rose"
    | "violet"
    | "cyan"
    | "orange"
    | "indigo"
    | "teal"
    | "fuchsia"
    | "lime"
    | "red";

export type SupportChannel = "chat" | "email" | "help";

export type FaqKey = "currencies" | "kyc" | "insurance" | "transfers" | "card";

export type LandingSectionId = LandingSection["id"];

export const LANDING_SECTIONS: LandingSection[] = [
    { type: "hero", id: "hero" },
    {
        type: "about",
        id: "about",
        tabs: [
            { key: "convenience", icon: CreditCardIcon },
            { key: "cryptoTopUp", icon: CoinsIcon },
            { key: "accessibility", icon: GlobeIcon },
        ],
    },
    {
        type: "services",
        id: "services",
        items: [
            { key: "multiCurrency", icon: WalletIcon },
            { key: "instantTransfers", icon: ZapIcon },
            { key: "security", icon: ShieldCheckIcon },
            { key: "cards", icon: CreditCardIcon },
            { key: "liveRates", icon: ChartCandlestickIcon },
            { key: "compliance", icon: BadgeCheckIcon },
        ],
    },
    {
        type: "partners",
        id: "partners",
        items: [
            { key: "northgate", tone: "sky" },
            { key: "alderBay", tone: "emerald" },
            { key: "halvorsen", tone: "amber" },
            { key: "lumenTrust", tone: "rose" },
            { key: "crestline", tone: "violet" },
            { key: "veridia", tone: "cyan" },
            { key: "brightwater", tone: "orange" },
            { key: "rhineMeridian", tone: "indigo" },
            { key: "summitRidge", tone: "teal" },
            { key: "solent", tone: "fuchsia" },
            { key: "cascadia", tone: "lime" },
            { key: "aurelius", tone: "red" },
        ],
    },
    {
        type: "license",
        id: "license",
        items: [
            { key: "banking", state: "inProgress" },
            { key: "amlKyc", state: "active" },
            { key: "clientProtection", state: "active" },
        ],
    },
    {
        type: "support",
        id: "support",
        channels: [
            { key: "chat", icon: MessageCircleIcon },
            { key: "email", icon: MailIcon },
            { key: "help", icon: BookOpenIcon },
        ],
        faq: ["currencies", "kyc", "insurance", "transfers", "card"],
    },
    { type: "contact", id: "contact" },
    { type: "footer", id: "footer" },
];

/** Sections linked from the header; clicking scrolls to `#<id>`. */
export const LANDING_NAV = [
    "about",
    "services",
    "partners",
    "license",
    "support",
    "contact",
] as const satisfies readonly LandingSectionId[];
