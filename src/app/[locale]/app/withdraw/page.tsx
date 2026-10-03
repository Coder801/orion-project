import { RequireKyc } from "@/features/auth/Guards";
import { WithdrawForm } from "@/features/payments/WithdrawForm";
import { UserRequests } from "@/features/payments/UserRequests";
import { MoneyPausedNotice } from "@/features/shared/MoneyPausedNotice";
import { Page } from "@/features/shared/Page";
import { pageMetadata } from "@/lib/metadata";

export const generateMetadata = pageMetadata("withdraw");

export default function WithdrawPage() {
    return (
        <Page pageKey="withdraw">
            <RequireKyc operation="withdraw">
                <div className="space-y-6">
                    <MoneyPausedNotice />
                    <WithdrawForm />
                    <UserRequests kinds={["withdrawal"]} />
                </div>
            </RequireKyc>
        </Page>
    );
}
