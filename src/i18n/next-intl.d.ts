import type en from "@/i18n/messages/en.json";
import type { Language } from "@/types";

declare module "next-intl" {
    interface AppConfig {
        Locale: Language;
        Messages: typeof en;
    }
}
