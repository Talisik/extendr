import path from "path";
import fs from "fs/promises";

import { Extension } from "./extension.js";
import { LoadOrdrItemType, LoadOrdrWritableItemType } from "./helpers/types.js";
import { Config } from "./helpers/config.js";
import { Loadr } from "./loadr.js";
import { getStat } from "./helpers/utils.js";

export class LoadOrdrItem {
    readonly config: LoadOrdrItemType;
    readonly extension?: Extension;

    constructor({
        config,
        extension,
    }: {
        config?: LoadOrdrItemType;
        extension?: Extension;
    }) {
        this.config = config ?? {
            enabled: false,
        };
        this.extension = extension;
    }

    get name() {
        const directory = path
            .normalize(this.extension!.config.path)
            .split(path.sep)
            .pop();
        const name = this.extension!.config.name;

        return `${directory}:${name}`;
    }
}

export class LoadOrdr {
    static items: LoadOrdrItem[] = [];

    static get writable(): LoadOrdrWritableItemType[] {
        return this.items.map((item) => ({
            ...item.config,
            name: item.name,
        }));
    }

    static #findExtension(item: LoadOrdrWritableItemType) {
        const [folderName, name] = item.name.split(":");
        const fullpath = path.join(Config.extensionsPath, folderName);

        return Loadr.extensions.find(
            (extension) =>
                extension.config.name === name &&
                extension.config.path === fullpath
        );
    }

    static async load() {
        const stat = await getStat(Config.loadOrderPath);

        if (!stat || !stat.isDirectory()) return;

        const data = await fs.readFile(Config.loadOrderPath, "utf8");
        const items = JSON.parse(data);

        this.items = items.map(
            (item: LoadOrdrWritableItemType) =>
                new LoadOrdrItem({
                    config: {
                        enabled: item.enabled,
                    },
                    extension: this.#findExtension(item),
                })
        );
    }

    static async save() {
        const stat = await getStat(Config.loadOrderPath);

        if (!stat || !stat.isDirectory())
            await fs.mkdir(
                path
                    .normalize(Config.loadOrderPath)
                    .split(path.sep)
                    .slice(0, -1)
                    .join(path.sep),
                {
                    recursive: true,
                }
            );

        await fs.writeFile(Config.loadOrderPath, JSON.stringify(this.writable));
    }
}
