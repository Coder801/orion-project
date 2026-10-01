import { Dashboard } from "@/features/dashboard/dashboard";
import { Page } from "@/features/shared/page";
import { pageMetadata } from "@/lib/metadata";

export const generateMetadata = pageMetadata("dashboard");

export default function DashboardPage() {
    return (
        <Page pageKey="dashboard">
            <Dashboard />
        </Page>
    );
}
