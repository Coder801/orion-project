import { Dashboard } from "@/features/dashboard/Dashboard";
import { Page } from "@/features/shared/Page";
import { pageMetadata } from "@/lib/metadata";

export const generateMetadata = pageMetadata("dashboard");

export default function DashboardPage() {
    return (
        <Page pageKey="dashboard">
            <Dashboard />
        </Page>
    );
}
