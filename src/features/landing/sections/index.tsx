"use client";

import { FullPageScroll } from "@/components/full-page-scroll";
import { LANDING_SECTIONS, type LandingSection } from "@/config/landing";
import { Hero } from "@/features/landing/Hero";
import { LandingFooter } from "@/features/landing/LandingFooter";
import { About } from "@/features/landing/sections/About";
import { Contact } from "@/features/landing/sections/Contact";
import { License } from "@/features/landing/sections/License";
import { Partners } from "@/features/landing/sections/Partners";
import { Services } from "@/features/landing/sections/Services";
import { Support } from "@/features/landing/sections/Support";

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
