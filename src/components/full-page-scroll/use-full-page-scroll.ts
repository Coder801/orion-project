"use client";

import { useEffect, useRef, type RefObject } from "react";

import { gsap, MOTION_QUERIES } from "@/lib/gsap";
import { dispatchSectionEnter } from "./section-events";

export interface FullPageScrollOptions {
    /** Sections inside the container, in order. Default: its direct children. */
    sectionSelector?: string;
    /** Transition duration in seconds. */
    duration?: number;
    /** GSAP ease of the transition. */
    ease?: string;
    /**
     * Wheel distance (px, accumulated within one gesture) needed to change
     * section. Lower = more sensitive; a mouse-wheel notch is ~100px.
     */
    wheelThreshold?: number;
    /** Silence (ms) that ends a wheel gesture — one gesture moves one section. */
    gestureGap?: number;
    /** Swipe distance (px) needed to change section on touch screens. */
    touchThreshold?: number;
    /** Mirror the active section's id in the URL hash (replaceState, no history entries). */
    syncHash?: boolean;
    /** Called after a transition completes. */
    onSectionChange?: (index: number) => void;
}

export interface FullPageScrollApi {
    /** Animate to a section by index (clamped to the first/last section). */
    goTo: (index: number) => void;
    next: () => void;
    previous: () => void;
}

type GestureMode =
    | { kind: "navigate" }
    | { kind: "done" }
    | { kind: "inner-y" }
    | { kind: "inner-x"; el: HTMLElement }
    | { kind: "page-y" };

/** Which end of a (possibly taller than viewport) section to land on. */
type Align = "start" | "end";

const DEFAULTS = {
    sectionSelector: ":scope > *",
    duration: 1,
    ease: "power3.inOut",
    wheelThreshold: 25,
    gestureGap: 200,
    touchThreshold: 50,
    syncHash: true,
} satisfies Omit<Required<FullPageScrollOptions>, "onSectionChange">;

// Small enough to ignore a tap, large enough to read a swipe's axis.
const TOUCH_AXIS_LOCK_PX = 8;
const SETTLE_DELAY_MS = 150;
const HORIZONTAL_SCROLL_DURATION = 0.45;
const PAGE_SCROLL_DURATION = 0.45;
// Share of the viewport one key press scrolls inside a tall section.
const KEY_SCROLL_RATIO = 0.5;
// New-swipe detection inside a continuous wheel stream (see startsNewSwipe):
// compare against the peak of the last few events; ignore jitter below the minimum.
const SWIPE_WINDOW = 4;
const SWIPE_RISE = 1.5;
const SWIPE_MIN_DELTA = 8;

/**
 * Full-page section navigation: one wheel gesture, swipe or key press moves
 * exactly one section, animated with GSAP. A section taller than the viewport
 * is scrolled through (page scroll, no inner scrollbar) until its edge first;
 * nested `overflow-y: auto` areas likewise scroll to their edge first.
 * Elements marked `data-fullpage-horizontal` turn vertical wheel into
 * horizontal scrolling. Desktop only: below the `lg` breakpoint and under
 * `prefers-reduced-motion` the page scrolls natively.
 * While active the container carries `data-fullpage-active`.
 */
export function useFullPageScroll(
    containerRef: RefObject<HTMLElement | null>,
    options: FullPageScrollOptions = {},
): FullPageScrollApi {
    const optionsRef = useRef(options);
    const indexRef = useRef(0);
    const animatingRef = useRef(false);
    const apiRef = useRef<FullPageScrollApi>({
        goTo: () => {},
        next: () => {},
        previous: () => {},
    });

    useEffect(() => {
        optionsRef.current = options;
    });

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        // Explicitly `undefined` options (e.g. forwarded component props) fall
        // back to the defaults instead of overriding them.
        const opt = () => {
            const merged: typeof DEFAULTS & FullPageScrollOptions = {
                ...DEFAULTS,
            };
            for (const [key, value] of Object.entries(optionsRef.current))
                if (value !== undefined)
                    Object.assign(merged, { [key]: value });
            return merged;
        };

        const sections = () =>
            Array.from(
                container.querySelectorAll<HTMLElement>(opt().sectionSelector),
            );
        const maxScroll = () =>
            document.documentElement.scrollHeight - window.innerHeight;
        // Scroll positions where a section fills the viewport: a single point
        // for a viewport-high section, a range for a taller one. The first
        // section always starts at the very top (anything rendered above it,
        // like a banner, stays reachable); the last may be shorter than the
        // viewport (a footer), so positions are clamped to the scroll range.
        const rangeOf = (index: number) => {
            const el = sections()[index];
            if (!el) return { start: 0, end: 0 };
            const max = maxScroll();
            const rect = el.getBoundingClientRect();
            const top = index === 0 ? 0 : rect.top + window.scrollY;
            const start = Math.min(Math.round(top), max);
            const bottom = rect.bottom + window.scrollY - window.innerHeight;
            const end = Math.min(Math.max(start, Math.round(bottom)), max);
            return { start, end };
        };
        const positionOf = (index: number, align: Align = "start") =>
            rangeOf(index)[align];
        const distanceTo = (index: number, y: number) => {
            const { start, end } = rangeOf(index);
            return y < start ? start - y : y > end ? y - end : 0;
        };
        const nearestIndex = () => {
            const y = window.scrollY;
            let best = 0;
            sections().forEach((_, i) => {
                if (distanceTo(i, y) < distanceTo(best, y)) best = i;
            });
            return best;
        };
        // Can the active (tall) section still scroll in `direction`?
        const canScrollWithin = (direction: number) => {
            const { start, end } = rangeOf(indexRef.current);
            const y = window.scrollY;
            return direction > 0 ? y < end - 1 : y > start + 1;
        };

        const syncHash = (index: number) => {
            if (!opt().syncHash) return;
            const id = sections()[index]?.id;
            const { pathname, search, hash } = window.location;
            const base = pathname + search;
            const url = index > 0 && id ? `${base}#${id}` : base;
            if (url !== base + hash)
                window.history.replaceState(window.history.state, "", url);
        };

        const activate = (index: number, direction: -1 | 0 | 1) => {
            const el = sections()[index];
            if (el) dispatchSectionEnter(el, { index, direction });
        };

        // Target of the in-section page scroll tween (see scrollWithin).
        let pageTarget: number | null = null;

        // Killing a tween skips its onComplete: always clear the busy flag too,
        // or every later gesture would be ignored.
        const stopTransition = () => {
            gsap.killTweensOf(window);
            animatingRef.current = false;
            pageTarget = null;
        };

        const goTo = (
            target: number,
            { instant = false, force = false, align = "start" as Align } = {},
        ) => {
            const list = sections();
            if (!list.length) return;
            const index = gsap.utils.clamp(0, list.length - 1, target);
            const y = positionOf(index, align);
            const direction = Math.sign(index - indexRef.current) as -1 | 0 | 1;
            const aligned = Math.abs(window.scrollY - y) < 2;
            if (!force && aligned && index === indexRef.current) return;

            stopTransition();
            indexRef.current = index;
            if (direction !== 0 || force) activate(index, direction);

            if (instant) {
                window.scrollTo(0, y);
                syncHash(index);
                return;
            }
            animatingRef.current = true;
            gsap.to(window, {
                duration: opt().duration,
                ease: opt().ease,
                scrollTo: { y, autoKill: false },
                onInterrupt: () => {
                    animatingRef.current = false;
                },
                onComplete: () => {
                    animatingRef.current = false;
                    syncHash(index);
                    optionsRef.current.onSectionChange?.(index);
                },
            });
        };

        // Stepping back lands on the previous section's bottom edge, so a tall
        // section is scrolled through upwards just like downwards.
        const step = (direction: number) =>
            goTo(indexRef.current + direction, {
                align: direction < 0 ? "end" : "start",
            });

        // Rest on the nearest section (or the nearest edge of a tall one).
        const settle = (options: { instant?: boolean } = {}) => {
            const index = nearestIndex();
            const y = window.scrollY;
            const { start, end } = rangeOf(index);
            if (y >= start - 2 && y <= end + 2 && !options.instant) {
                // Native scrolling (touch momentum) can stop inside another
                // section's range: it still has to be entered.
                if (index !== indexRef.current) {
                    const direction = Math.sign(index - indexRef.current);
                    indexRef.current = index;
                    activate(index, direction as -1 | 1);
                    syncHash(index);
                }
                return;
            }
            goTo(index, {
                ...options,
                force: true,
                align: y > end ? "end" : "start",
            });
        };

        // Keyboard scrolling inside the active tall section, never past its edges.
        const scrollWithin = (delta: number) => {
            const { start, end } = rangeOf(indexRef.current);
            const from = pageTarget ?? window.scrollY;
            const to = gsap.utils.clamp(start, end, from + delta);
            pageTarget = to;
            gsap.to(window, {
                scrollTo: { y: to, autoKill: false },
                duration: PAGE_SCROLL_DURATION,
                ease: "power2.out",
                overwrite: true,
                onComplete: () => {
                    pageTarget = null;
                },
            });
        };

        apiRef.current = {
            goTo: (i) => goTo(i),
            next: () => step(1),
            previous: () => step(-1),
        };

        const sectionOf = (node: Element | null) =>
            sections().find((s) => s.contains(node));

        // Innermost scrollable ancestor (within the section) that can still
        // move in `direction`; the gesture belongs to it, not to the page.
        const innerScrollTarget = (
            node: Element | null,
            direction: number,
            allowHorizontal: boolean,
        ): GestureMode | null => {
            const section = sectionOf(node);
            for (
                let el = node instanceof HTMLElement ? node : null;
                el && section && el !== section.parentElement;
                el = el.parentElement
            ) {
                if (
                    allowHorizontal &&
                    el.hasAttribute("data-fullpage-horizontal")
                ) {
                    const max = el.scrollWidth - el.clientWidth;
                    if (
                        (direction > 0 && el.scrollLeft < max - 1) ||
                        (direction < 0 && el.scrollLeft > 1)
                    )
                        return { kind: "inner-x", el };
                }
                const { overflowY } = getComputedStyle(el);
                if (
                    (overflowY === "auto" || overflowY === "scroll") &&
                    el.scrollHeight > el.clientHeight + 1
                ) {
                    const max = el.scrollHeight - el.clientHeight;
                    if (
                        (direction > 0 && el.scrollTop < max - 1) ||
                        (direction < 0 && el.scrollTop > 1)
                    )
                        return { kind: "inner-y" };
                }
                if (el === section) break;
            }
            return null;
        };

        const horizontalTargets = new WeakMap<HTMLElement, number>();
        const scrollHorizontally = (el: HTMLElement, delta: number) => {
            const max = el.scrollWidth - el.clientWidth;
            const from = horizontalTargets.get(el) ?? el.scrollLeft;
            const to = gsap.utils.clamp(0, max, from + delta);
            horizontalTargets.set(el, to);
            gsap.to(el, {
                scrollLeft: to,
                duration: HORIZONTAL_SCROLL_DURATION,
                ease: "power2.out",
                overwrite: true,
                onComplete: () => horizontalTargets.delete(el),
            });
        };

        // ── Wheel / trackpad ────────────────────────────────────────────────
        const gesture = {
            mode: { kind: "done" } as GestureMode,
            total: 0,
            last: 0,
            direction: 0,
            /** Magnitudes of the latest wheel events (newest last). */
            recent: [] as number[],
        };

        // Trackpad inertia keeps streaming decaying deltas for 1–2 s, so the
        // next swipe often arrives with no pause in between. A sharp rise in
        // magnitude or a reversal marks it as a new gesture anyway — otherwise
        // every swipe made during a momentum tail would be swallowed.
        const startsNewSwipe = (delta: number) => {
            if (gesture.mode.kind === "navigate" || animatingRef.current)
                return false;
            if (Math.sign(delta) !== gesture.direction) return true;
            const abs = Math.abs(delta);
            return (
                abs >= SWIPE_MIN_DELTA &&
                abs > Math.max(...gesture.recent) * SWIPE_RISE
            );
        };

        // Momentum tail: wheel magnitudes shrinking event after event.
        const isDecaying = () =>
            gesture.recent.length >= SWIPE_WINDOW &&
            gesture.recent.every((v, i, all) => i === 0 || v <= all[i - 1]);

        // Inside a tall section the wheel scrolls natively (1:1, no easing
        // lag); only the step that would cross the edge is clamped to it.
        // Returns false once the section is already at that edge.
        let wheelTarget = 0;
        const wheelWithin = (event: WheelEvent, delta: number) => {
            const { start, end } = rangeOf(indexRef.current);
            const edge = delta > 0 ? end : start;
            // At the edge, or already easing into it.
            if (wheelTarget === edge || Math.abs(window.scrollY - edge) < 1)
                return false;
            // Track where native (possibly smooth) scrolling is heading, so a
            // fast wheel spin can't overshoot the edge before scrollY catches up.
            const next = wheelTarget + delta;
            if (next > start && next < end) {
                wheelTarget = next;
                return true;
            }
            event.preventDefault();
            wheelTarget = edge;
            gsap.to(window, {
                scrollTo: { y: edge, autoKill: false },
                duration: PAGE_SCROLL_DURATION,
                ease: "power2.out",
                overwrite: true,
            });
            return true;
        };

        const onWheel = (event: WheelEvent) => {
            if (event.ctrlKey || !(event.target instanceof Element)) return; // pinch-zoom
            if (!sectionOf(event.target)) return; // overlays, portals
            const scale =
                event.deltaMode === 1
                    ? 16
                    : event.deltaMode === 2
                      ? window.innerHeight
                      : 1;
            const delta = event.deltaY * scale;
            if (!delta) return;

            const now = performance.now();
            const fresh =
                now - gesture.last > opt().gestureGap || startsNewSwipe(delta);
            gesture.recent = fresh
                ? [Math.abs(delta)]
                : [...gesture.recent.slice(1 - SWIPE_WINDOW), Math.abs(delta)];
            gesture.direction = Math.sign(delta);
            if (fresh) {
                // A gesture starting mid-transition is consumed, so inertia
                // after the animation can't trigger a second move.
                gesture.mode = animatingRef.current
                    ? { kind: "done" }
                    : (innerScrollTarget(event.target, delta, true) ??
                      (canScrollWithin(delta)
                          ? { kind: "page-y" }
                          : { kind: "navigate" }));
                gesture.total = 0;
            }
            gesture.last = now;

            if (gesture.mode.kind === "inner-y") return; // native inner scroll
            if (gesture.mode.kind === "page-y") {
                if (fresh) wheelTarget = window.scrollY;
                if (wheelWithin(event, delta)) return;
                // At the section edge inertia stops, but a hand still pushing
                // carries on to the next section without a pause.
                if (isDecaying()) {
                    event.preventDefault();
                    return;
                }
                gesture.mode = { kind: "navigate" };
                gesture.total = 0;
            }
            event.preventDefault();
            if (gesture.mode.kind === "inner-x") {
                scrollHorizontally(gesture.mode.el, delta);
                return;
            }
            if (gesture.mode.kind === "done" || animatingRef.current) return;

            gesture.total += delta;
            if (Math.abs(gesture.total) >= opt().wheelThreshold) {
                gesture.mode = { kind: "done" };
                step(Math.sign(gesture.total));
            }
        };

        // ── Touch ───────────────────────────────────────────────────────────
        const touch = {
            x: 0,
            y: 0,
            mode: null as "navigate" | "native" | null,
        };

        const onTouchStart = (event: TouchEvent) => {
            const point = event.touches[0];
            if (!point || event.touches.length > 1) return;
            touch.x = point.clientX;
            touch.y = point.clientY;
            touch.mode = null;
        };

        const onTouchMove = (event: TouchEvent) => {
            const point = event.touches[0];
            if (!point || !(event.target instanceof Element)) return;
            if (!sectionOf(event.target)) return;
            const dx = touch.x - point.clientX;
            const dy = touch.y - point.clientY;
            if (touch.mode === null) {
                if (Math.max(Math.abs(dx), Math.abs(dy)) < TOUCH_AXIS_LOCK_PX)
                    return;
                // Horizontal swipes (carousels), scrollable content and tall
                // sections stay native; the scroll handler settles afterwards.
                touch.mode =
                    Math.abs(dx) > Math.abs(dy) ||
                    innerScrollTarget(event.target, dy, false) ||
                    canScrollWithin(dy)
                        ? "native"
                        : "navigate";
            }
            if (touch.mode === "navigate" && event.cancelable)
                event.preventDefault();
        };

        const onTouchEnd = (event: TouchEvent) => {
            const point = event.changedTouches[0];
            if (touch.mode !== "navigate" || !point) return;
            touch.mode = null;
            const dy = touch.y - point.clientY;
            if (Math.abs(dy) >= opt().touchThreshold && !animatingRef.current)
                step(Math.sign(dy));
        };

        // ── Keyboard ────────────────────────────────────────────────────────
        const onKeyDown = (event: KeyboardEvent) => {
            if (
                event.defaultPrevented ||
                event.altKey ||
                event.metaKey ||
                event.ctrlKey
            )
                return;
            const active = document.activeElement;
            if (
                active instanceof HTMLElement &&
                (active.isContentEditable ||
                    active.closest(
                        "input, textarea, select, [role='listbox'], [role='dialog'], [role='menu']",
                    ))
            )
                return;
            const direction =
                event.key === "ArrowDown" ||
                event.key === "PageDown" ||
                (event.key === " " && !event.shiftKey)
                    ? 1
                    : event.key === "ArrowUp" ||
                        event.key === "PageUp" ||
                        (event.key === " " && event.shiftKey)
                      ? -1
                      : 0;
            if (event.key === "Home" || event.key === "End") {
                event.preventDefault();
                goTo(event.key === "Home" ? 0 : sections().length - 1);
                return;
            }
            if (!direction) return;
            if (
                active instanceof Element &&
                innerScrollTarget(active, direction, false)
            )
                return;
            event.preventDefault();
            if (animatingRef.current) return;
            if (canScrollWithin(direction))
                scrollWithin(direction * window.innerHeight * KEY_SCROLL_RATIO);
            else step(direction);
        };

        // ── Anchors, hash, resize, stray native scroll ──────────────────────
        const indexOfHash = (hash: string) => {
            const id = decodeURIComponent(hash.replace(/^#/, ""));
            return id ? sections().findIndex((s) => s.id === id) : -1;
        };

        // Overlays (e.g. the mobile menu sheet) lock page scroll while closing;
        // wait for the lock to lift before animating the window.
        const whenScrollable = (run: () => void, framesLeft = 60) => {
            const locked = [document.documentElement, document.body].some(
                (el) => getComputedStyle(el).overflow === "hidden",
            );
            if (locked && framesLeft > 0)
                requestAnimationFrame(() =>
                    whenScrollable(run, framesLeft - 1),
                );
            else run();
        };

        const onClick = (event: MouseEvent) => {
            if (event.defaultPrevented || event.button !== 0) return;
            const link =
                event.target instanceof Element
                    ? event.target.closest<HTMLAnchorElement>('a[href^="#"]')
                    : null;
            const index = link ? indexOfHash(link.hash) : -1;
            if (index < 0) return;
            event.preventDefault();
            whenScrollable(() => goTo(index));
        };

        const onHashChange = () => {
            const index = indexOfHash(window.location.hash);
            if (index >= 0) goTo(index);
        };

        let resizeTimer: ReturnType<typeof setTimeout> | undefined;
        const onResize = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (animatingRef.current) return;
                stopTransition();
                const { start, end } = rangeOf(indexRef.current);
                window.scrollTo(
                    0,
                    gsap.utils.clamp(start, end, window.scrollY),
                );
            }, SETTLE_DELAY_MS);
        };

        // Scrollbar drags, touch momentum, find-in-page or focus jumps can
        // leave the page between sections: once native scrolling settles,
        // snap to the nearest one.
        let settleTimer: ReturnType<typeof setTimeout> | undefined;
        const onScroll = () => {
            if (animatingRef.current) return;
            clearTimeout(settleTimer);
            settleTimer = setTimeout(() => {
                if (!animatingRef.current) settle();
            }, SETTLE_DELAY_MS);
        };

        const mm = gsap.matchMedia();
        mm.add(MOTION_QUERIES.desktop, () => {
            container.setAttribute("data-fullpage-active", "");
            const previousRestoration = window.history.scrollRestoration;
            window.history.scrollRestoration = "manual";

            const initial = indexOfHash(window.location.hash);
            if (initial >= 0) goTo(initial, { instant: true, force: true });
            else settle({ instant: true });

            const active = { passive: false } as const;
            window.addEventListener("wheel", onWheel, active);
            window.addEventListener("touchstart", onTouchStart, {
                passive: true,
            });
            window.addEventListener("touchmove", onTouchMove, active);
            window.addEventListener("touchend", onTouchEnd);
            window.addEventListener("keydown", onKeyDown);
            window.addEventListener("hashchange", onHashChange);
            window.addEventListener("resize", onResize);
            window.addEventListener("scroll", onScroll, { passive: true });
            document.addEventListener("click", onClick);

            return () => {
                container.removeAttribute("data-fullpage-active");
                window.history.scrollRestoration = previousRestoration;
                window.removeEventListener("wheel", onWheel);
                window.removeEventListener("touchstart", onTouchStart);
                window.removeEventListener("touchmove", onTouchMove);
                window.removeEventListener("touchend", onTouchEnd);
                window.removeEventListener("keydown", onKeyDown);
                window.removeEventListener("hashchange", onHashChange);
                window.removeEventListener("resize", onResize);
                window.removeEventListener("scroll", onScroll);
                document.removeEventListener("click", onClick);
                clearTimeout(resizeTimer);
                clearTimeout(settleTimer);
                stopTransition();
            };
        });

        return () => mm.revert();
    }, [containerRef]);

    return {
        goTo: (index) => apiRef.current.goTo(index),
        next: () => apiRef.current.next(),
        previous: () => apiRef.current.previous(),
    };
}
