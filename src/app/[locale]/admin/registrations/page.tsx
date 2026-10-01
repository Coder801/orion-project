import { Registrations } from "@/features/admin/Registrations";
import { Page } from "@/features/shared/Page";
import { pageMetadata } from "@/lib/metadata";

export const generateMetadata = pageMetadata("registrations");

export default function AdminRegistrationsPage() {
    return (
        <Page pageKey="registrations">
            <Registrations />
        </Page>
    );
}
