"use client";

import { FullPageScroll } from "@/components/full-page-scroll";
import { LANDING_SECTIONS, type LandingSection } from "@/config/landing";
import { Hero } from "@/features/landing/hero";
import { LandingFooter } from "@/features/landing/landing-footer";
import { About } from "@/features/landing/sections/about";
import { Contact } from "@/features/landing/sections/contact";
import { License } from "@/features/landing/sections/license";
import { Partners } from "@/features/landing/sections/partners";
import { Services } from "@/features/landing/sections/services";
import { Support } from "@/features/landing/sections/support";

// Client-side on purpose: section configs carry icon components, which can't
// cross the server → client boundary as props.
export function LandingSections() {
    const body = LANDING_SECTIONS.filter((s) => s.type !== "footer");
    const footer = LANDING_SECTIONS.find((s) => s.type === "footer");

    // Each section is one full-page step; the footer is the final step
    // (shorter than a viewport, so it lines up with the page bottom).
    return (
        <FullPageScroll sectionSelector="[data-section]" className="flex-1">
            <main id="main">
                {body.map((section) => (
                    <LandingSectionView key={section.id} section={section} />
                ))}
            </main>
            {footer && <LandingSectionView section={footer} />}
        </FullPageScroll>
    );
}

function LandingSectionView({ section }: { section: LandingSection }) {
    switch (section.type) {
        case "hero":
            return <Hero />;
        case "about":
            return <About {...section} />;
        case "services":
            return <Services {...section} />;
        case "partners":
            return <Partners items={section.items} />;
        case "license":
            return <License {...section} />;
        case "support":
            return <Support {...section} />;
        case "contact":
            return <Contact />;
        case "footer":
            return <LandingFooter />;
    }
}
