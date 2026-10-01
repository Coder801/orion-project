"use client";

import { useEffect, type RefObject } from "react";

/** Fired on a section element when it becomes the active full-page section. */
export const SECTION_ENTER_EVENT = "fullpage:enter";

export interface SectionEnterDetail {
    index: number;
    /** 1 = arrived from above, -1 = from below, 0 = initial load / jump. */
    direction: -1 | 0 | 1;
}

export function dispatchSectionEnter(
    section: Element,
    detail: SectionEnterDetail,
) {
    section.dispatchEvent(
        new CustomEvent<SectionEnterDetail>(SECTION_ENTER_EVENT, { detail }),
    );
}

/**
 * Runs `onEnter` whenever the section behind `ref` becomes active. Use it to
 * start entrance animations instead of viewport-based triggers, which can't see
 * content inside a section's own scroll area.
 */
export function useSectionEnter(
    ref: RefObject<HTMLElement | null>,
    onEnter: (detail: SectionEnterDetail) => void,
) {
    useEffect(() => {
        const section = ref.current;
        if (!section) return;
        const listener = (event: Event) =>
            onEnter((event as CustomEvent<SectionEnterDetail>).detail);
        section.addEventListener(SECTION_ENTER_EVENT, listener);
        return () => section.removeEventListener(SECTION_ENTER_EVENT, listener);
    }, [ref, onEnter]);
}
