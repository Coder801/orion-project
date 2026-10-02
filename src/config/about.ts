import {
    ArrowLeftRightIcon,
    BadgeCheckIcon,
    CoinsIcon,
    CreditCardIcon,
    GaugeIcon,
    GlobeIcon,
    HeadsetIcon,
    LandmarkIcon,
    LockIcon,
    RepeatIcon,
    WalletIcon,
    type LucideIcon,
} from "lucide-react";

export interface AboutItem {
    /** Key under `about.<section>.<key>` with `title` and `text`. */
    key: string;
    icon: LucideIcon;
}

/** Verified regulatory data; null hides the section (never show placeholders). */
export interface AboutLicense {
    number: string;
    regulator: string;
    registryUrl: string;
}

export interface AboutMetric {
    /** Key under `about.metrics.<key>`. */
    key: string;
    value: string;
}

export interface AboutConfig {
    advantages: AboutItem[];
    services: AboutItem[];
    license: AboutLicense | null;
    metrics: AboutMetric[] | null;
}

// Structure of the About page. Copy lives in i18n (`about.*`); the license and
// metrics sections render only when real, confirmed data is configured here.
export const ABOUT_CONFIG: AboutConfig = {
    advantages: [
        { key: "multiCurrency", icon: GlobeIcon },
        { key: "security", icon: LockIcon },
        { key: "speed", icon: GaugeIcon },
        { key: "support", icon: HeadsetIcon },
    ],
    services: [
        { key: "accounts", icon: WalletIcon },
        { key: "crypto", icon: CoinsIcon },
        { key: "transfers", icon: ArrowLeftRightIcon },
        { key: "conversion", icon: RepeatIcon },
        { key: "cards", icon: CreditCardIcon },
        { key: "credit", icon: LandmarkIcon },
    ],
    license: null,
    metrics: null,
};

export const ABOUT_VERIFIED_ICON = BadgeCheckIcon;
