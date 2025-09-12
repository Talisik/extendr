import path from "path";
import fs from "fs/promises";

import { Extension } from "./extension.js";
import {
    LoadOrderItemType,
    LoadOrderWritableItemType,
} from "./helpers/types.js";
import { Terminal } from "./terminal.js";
import { Config } from "./helpers/config.js";
import { Loader } from "./loader.js";
import { getStat } from "./helpers/utils.js";

class LoadOrderItem {
    readonly config: LoadOrderItemType;
    readonly extension?: Extension;

    constructor({
        config,
        extension,
    }: {
        config?: LoadOrderItemType;
        extension?: Extension;
    }) {
        this.config = config ?? {
            installed: false,
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

    async *install() {
        if (!this.extension)
            return {
                ok: false,
                reason: "Extension not found",
            };

        if (this.extension.config.valid)
            return {
                ok: false,
                reason: "Extension is not valid",
            };

        const npmCli = path.join(
            Config.resourcesPath,
            "app/node_modules/npm/bin/npm-cli.js"
        );
        const terminal = await Terminal.new({
            command: process.execPath,
            args: [npmCli, "run", "build"],
            spawnConfig: {
                cwd: this.extension!.config.path,
                stdio: "inherit",
            },
        });

        if (terminal == null)
            return {
                ok: false,
                reason: "Failed to spawn terminal",
            };

        return {
            ok: true,
            terminal,
        };
    }
}

export class LoadOrder {
    static items: LoadOrderItem[] = [];

    static get asWritable(): LoadOrderWritableItemType[] {
        return this.items.map((item) => ({
            ...item.config,
            name: item.name,
        }));
    }

    static #findExtension(item: LoadOrderWritableItemType) {
        const [folderName, name] = item.name.split(":");
        const fullpath = path.join(Config.extensionsPath, folderName);

        return Loader.extensions.find(
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
            (item: LoadOrderWritableItemType) =>
                new LoadOrderItem({
                    config: {
                        installed: item.installed,
                    },
                    extension: this.#findExtension(item),
                })
        );
    }

    static async save() {
        const stat = await getStat(Config.loadOrderPath);

        if (!stat || !stat.isDirectory())
            await fs.mkdir(Config.loadOrderPath, { recursive: true });

        await fs.writeFile(
            Config.loadOrderPath,
            JSON.stringify(this.asWritable)
        );
    }
}
