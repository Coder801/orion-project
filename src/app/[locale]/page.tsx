import { LandingHeader } from "@/features/landing/LandingHeader";
import { LandingSections } from "@/features/landing/sections";

export default function LandingPage() {
    return (
        <div className="relative flex min-h-screen flex-col">
            <LandingHeader />
            <LandingSections />
        </div>
    );
}
