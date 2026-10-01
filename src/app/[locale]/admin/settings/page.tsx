import { PlatformSettingsForm } from "@/features/admin/platform-settings-form";
import { Page } from "@/features/shared/page";
import { pageMetadata } from "@/lib/metadata";

export const generateMetadata = pageMetadata("adminSettings");

export default function AdminSettingsPage() {
    return (
        <Page pageKey="adminSettings">
            <PlatformSettingsForm />
        </Page>
    );
}
