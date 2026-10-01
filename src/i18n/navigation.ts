import { createNavigation } from "next-intl/navigation";
import { routing } from "@/i18n/routing";

// Locale-aware wrappers: hrefs and pathnames are written without the locale prefix.
export const { Link, redirect, usePathname, useRouter, getPathname } =
    createNavigation(routing);
