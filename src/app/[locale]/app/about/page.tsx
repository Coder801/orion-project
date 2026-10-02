import { About } from "@/features/about/About";
import { Page } from "@/features/shared/Page";
import { pageMetadata } from "@/lib/metadata";

export const generateMetadata = pageMetadata("about");

export default function AboutPage() {
    return (
        <Page pageKey="about">
            <About />
        </Page>
    );
}
