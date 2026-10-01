import { RequestsQueue } from "@/features/admin/requests-queue";
import { Page } from "@/features/shared/page";
import { pageMetadata } from "@/lib/metadata";

export const generateMetadata = pageMetadata("conversions");

export default function AdminConversionsPage() {
    return (
        <Page pageKey="conversions">
            <RequestsQueue kinds={["conversion"]} />
        </Page>
    );
}
