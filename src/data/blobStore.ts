import type { StoredFile } from "@/domain/types";

// Uploaded documents stay in memory for the tab's lifetime; only their metadata
// is persisted with the rest of the mock database.
const blobs = new Map<string, Blob>();
let counter = 0;

export function putBlob(file: File): StoredFile {
    counter += 1;
    const id = `blob_${Date.now().toString(36)}_${counter}`;
    blobs.set(id, file);
    return { id, name: file.name, size: file.size, mimeType: file.type };
}

export function getBlob(id: string): Blob | undefined {
    return blobs.get(id);
}
