import fs from "fs/promises";

export async function getStat(path: string) {
    try {
        const stat = await fs.stat(path);
        return stat;
    } catch {}
}

export function binaryInsert<T>(
    arr: T[],
    value: T,
    selector: (item: T) => number
) {
    let low = 0,
        high = arr.length;

    while (low < high) {
        const mid = Math.floor((low + high) / 2);

        if (selector(arr[mid]) < selector(value)) low = mid + 1;
        else high = mid;
    }

    arr.splice(low, 0, value);
}
