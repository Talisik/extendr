import path from "path";
import fs from "fs/promises";

import { Extension } from "./extension.js";
import { Config } from "./helpers/config.js";
import { Loadr } from "./loadr.js";
import { getStat } from "./helpers/utils.js";

export class LoadOrdr {
    /**
     * All extensions listed in this array are considered as enabled.
     */
    static extensions: Extension[] = [];

    /**
     * For displaying to the user.
     */
    static get displayable() {
        return this.extensions.map((item) => ({
            extendedName: item.extendedName,
            extension: {
                ...item.config,
                main: undefined,
            },
        }));
    }

    static #findExtension(extendedName: string) {
        const [extensionsName, extensionFolderName, extensionName] =
            extendedName.split(":");
        const extensionsPath = Config.extensionsPathOf(extensionsName);

        if (!extensionsPath) return;

        const fullpath = path.join(
            extensionsPath.directory,
            extensionFolderName
        );

        return Loadr.extensions.find(
            (extension) =>
                extension.config.name === extensionName &&
                extension.config.fullpath === fullpath
        );
    }

    /**
     * Sort the extensions by dependencies.
     */
    static sort() {
        this.extensions = this.extensions.sort((a, b) => {
            // If a depends on b, b should come first (return positive)
            if (a.config.dependencies.includes(b.config.name!)) return 1;

            // If b depends on a, a should come first (return negative)
            if (b.config.dependencies.includes(a.config.name!)) return -1;

            // No dependency relationship, maintain original order
            return 0;
        });
    }

    /**
     * Load the load order from the file.
     */
    static async load() {
        const stat = await getStat(Config.loadOrderPath);

        if (!stat || stat.isDirectory()) return;

        const data = await fs.readFile(Config.loadOrderPath, "utf8");
        const items = JSON.parse(data);

        this.extensions = items.map(
            (extendedName: string) =>
                this.#findExtension(extendedName) ??
                new Extension(
                    {
                        name: extendedName,
                        fullpath: "",
                        module: {},
                        directory: {
                            name: extendedName.split(":")[0],
                            directory: "",
                        },
                        valid: false,
                        reason: "Extension not found",
                        dependencies: [],
                    },
                    []
                )
        );

        if (Config.log) {
            const valid = this.extensions.filter((item) => item.config.valid);

            console.log(
                `Loaded ${this.extensions.length} extension(s) in load order,`,
                `where ${valid.length} are valid.`
            );
        }
    }

    /**
     * Save the load order to the file.
     */
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

        await fs.writeFile(
            Config.loadOrderPath,
            JSON.stringify(this.extensions)
        );
    }
}
