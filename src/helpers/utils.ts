import fs from "fs/promises";

export async function getStat(path: string) {
    try {
        const stat = await fs.stat(path);
        return stat;
    } catch {}
}
