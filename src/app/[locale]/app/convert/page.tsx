import { RequireKyc } from "@/features/auth/guards";
import { ConvertForm } from "@/features/convert/convert-form";
import { UserRequests } from "@/features/payments/user-requests";
import { Page } from "@/features/shared/page";
import { pageMetadata } from "@/lib/metadata";

export const generateMetadata = pageMetadata("convert");

export default function ConvertPage() {
    return (
        <Page pageKey="convert">
            <RequireKyc operation="convert">
                <div className="space-y-6">
                    <ConvertForm />
                    <UserRequests kinds={["conversion"]} />
                </div>
            </RequireKyc>
        </Page>
    );
}
