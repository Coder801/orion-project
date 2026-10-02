import { RATES_REFRESH_MS } from "@/config/currencies";
import { MockRatesProvider } from "@/data/MockRatesProvider";
import { MockRepository, type DbState } from "@/data/MockRepository";
import type { Repository } from "@/data/repository";
import { createSeed, DB_VERSION } from "@/data/seed";
import type { RatesProvider } from "@/domain/rates";

// The mock "backend" lives in the browser tab and survives reloads via localStorage.
const STORAGE_KEY = "orion-demo-db";

let repository: MockRepository | null = null;
let rates: RatesProvider | null = null;

function load(): DbState {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw) as DbState;
            if (parsed.version === DB_VERSION) return parsed;
        }
    } catch {
        // Corrupt or unavailable storage: fall back to the seed.
    }
    return createSeed();
}

function save(state: DbState): void {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
        // Storage full or blocked: keep working in memory.
    }
}

export function getRepository(): Repository {
    if (typeof window === "undefined") {
        throw new Error("The mock repository is client-only");
    }
    repository ??= new MockRepository(load(), { onCommit: save });
    return repository;
}

export function getRatesProvider(): RatesProvider {
    rates ??= new MockRatesProvider(() => getRepository().settings.get(), {
        bps: 15,
        periodMs: RATES_REFRESH_MS,
    });
    return rates;
}

export function resetDemoData(): void {
    const seed = createSeed();
    save(seed);
    repository = new MockRepository(seed, { onCommit: save });
}

const LATENCY_MS = 350;

/** Simulated network latency around a synchronous repository call. */
export function withLatency<T>(work: () => T, ms = LATENCY_MS): Promise<T> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            try {
                resolve(work());
            } catch (error) {
                reject(error);
            }
        }, ms);
    });
}
