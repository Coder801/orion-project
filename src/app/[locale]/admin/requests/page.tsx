import { RequestsQueue } from "@/features/admin/requests-queue";
import { Page } from "@/features/shared/page";
import { pageMetadata } from "@/lib/metadata";

export const generateMetadata = pageMetadata("requests");

export default function AdminRequestsPage() {
    return (
        <Page pageKey="requests">
            <RequestsQueue kinds={["deposit", "withdrawal", "transfer"]} />
        </Page>
    );
}
