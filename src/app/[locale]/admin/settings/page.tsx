import { PlatformSettingsForm } from "@/features/admin/PlatformSettingsForm";
import { Page } from "@/features/shared/Page";
import { pageMetadata } from "@/lib/metadata";

export const generateMetadata = pageMetadata("adminSettings");

export default function AdminSettingsPage() {
    return (
        <Page pageKey="adminSettings">
            <PlatformSettingsForm />
        </Page>
    );
}
