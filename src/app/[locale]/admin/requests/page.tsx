import { RequestsQueue } from "@/features/admin/RequestsQueue";
import { Page } from "@/features/shared/Page";
import { pageMetadata } from "@/lib/metadata";

export const generateMetadata = pageMetadata("requests");

export default function AdminRequestsPage() {
    return (
        <Page pageKey="requests">
            <RequestsQueue kinds={["deposit", "withdrawal", "transfer"]} />
        </Page>
    );
}
