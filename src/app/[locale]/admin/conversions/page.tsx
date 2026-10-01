import { RequestsQueue } from "@/features/admin/RequestsQueue";
import { Page } from "@/features/shared/Page";
import { pageMetadata } from "@/lib/metadata";

export const generateMetadata = pageMetadata("conversions");

export default function AdminConversionsPage() {
    return (
        <Page pageKey="conversions">
            <RequestsQueue kinds={["conversion"]} />
        </Page>
    );
}
