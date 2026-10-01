import { Settings } from "@/features/settings/settings";
import { Page } from "@/features/shared/page";
import { pageMetadata } from "@/lib/metadata";

export const generateMetadata = pageMetadata("settings");

export default function SettingsPage() {
    return (
        <Page pageKey="settings">
            <Settings />
        </Page>
    );
}
