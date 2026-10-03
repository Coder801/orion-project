import { RequireKyc } from "@/features/auth/Guards";
import { ConvertForm } from "@/features/convert/ConvertForm";
import { UserRequests } from "@/features/payments/UserRequests";
import { MoneyPausedNotice } from "@/features/shared/MoneyPausedNotice";
import { Page } from "@/features/shared/Page";
import { pageMetadata } from "@/lib/metadata";

export const generateMetadata = pageMetadata("convert");

export default function ConvertPage() {
    return (
        <Page pageKey="convert">
            <RequireKyc operation="convert">
                <div className="space-y-6">
                    <MoneyPausedNotice />
                    <ConvertForm />
                    <UserRequests kinds={["conversion"]} />
                </div>
            </RequireKyc>
        </Page>
    );
}
