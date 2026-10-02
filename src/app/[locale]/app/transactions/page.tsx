import { Suspense } from "react";

import { Page } from "@/features/shared/Page";
import { TransactionHistory } from "@/features/transactions/TransactionHistory";
import { pageMetadata } from "@/lib/metadata";

export const generateMetadata = pageMetadata("transactions");

export default function TransactionsPage() {
    return (
        <Page pageKey="transactions">
            {/* useSearchParams needs a Suspense boundary for static rendering. */}
            <Suspense>
                <TransactionHistory />
            </Suspense>
        </Page>
    );
}
