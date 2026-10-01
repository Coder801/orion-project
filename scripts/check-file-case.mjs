// Fails when a path tracked by git differs from the file on disk only by letter case.
// macOS/Windows filesystems are case-insensitive, so `git mv Foo.tsx foo.tsx` or a plain
// rename can leave git with `Foo.tsx` while imports use `foo` — it builds locally but
// breaks on Linux CI. ESLint/tsc only see the disk, so this check reads the git index.
import { execFileSync } from "node:child_process";
import { readdirSync } from "node:fs";
import path from "node:path";

const tracked = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" })
    .split("\0")
    .filter(Boolean);

const dirCache = new Map();
function namesIn(dir) {
    if (!dirCache.has(dir)) {
        try {
            dirCache.set(dir, new Set(readdirSync(dir || ".")));
        } catch {
            dirCache.set(dir, null);
        }
    }
    return dirCache.get(dir);
}

const problems = [];
const seen = new Map();

for (const file of tracked) {
    const lower = file.toLowerCase();
    if (seen.has(lower)) {
        problems.push(
            `${file} collides with ${seen.get(lower)} (differ only by case)`,
        );
    }
    seen.set(lower, file);

    // Compare every path segment with the real name on disk.
    const parts = file.split("/");
    for (let i = 0; i < parts.length; i++) {
        const names = namesIn(parts.slice(0, i).join("/"));
        // Missing dir/file (deleted, not yet staged) — not a case problem.
        if (!names || names.has(parts[i])) continue;
        const actual = [...names].find(
            (n) => n.toLowerCase() === parts[i].toLowerCase(),
        );
        if (actual) {
            const onDisk = [...parts.slice(0, i), actual].join(path.posix.sep);
            problems.push(`git tracks "${file}" but disk has "${onDisk}"`);
        }
        break;
    }
}

if (problems.length > 0) {
    console.error("File name case mismatches between git and disk:\n");
    for (const p of problems) console.error(`  ${p}`);
    console.error(
        "\nFix with a two-step rename: git mv Foo.tsx tmp.tsx && git mv tmp.tsx foo.tsx",
    );
    process.exit(1);
}
