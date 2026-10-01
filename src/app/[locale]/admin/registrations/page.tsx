import { Registrations } from "@/features/admin/registrations";
import { Page } from "@/features/shared/page";
import { pageMetadata } from "@/lib/metadata";

export const generateMetadata = pageMetadata("registrations");

export default function AdminRegistrationsPage() {
    return (
        <Page pageKey="registrations">
            <Registrations />
        </Page>
    );
}
