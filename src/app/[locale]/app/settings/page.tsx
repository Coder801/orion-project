import { Settings } from "@/features/settings/Settings";
import { Page } from "@/features/shared/Page";
import { pageMetadata } from "@/lib/metadata";

export const generateMetadata = pageMetadata("settings");

export default function SettingsPage() {
    return (
        <Page pageKey="settings">
            <Settings />
        </Page>
    );
}
