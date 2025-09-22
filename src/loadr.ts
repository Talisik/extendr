import fs from "fs/promises";
import { Extension } from "./extension.js";
import { Config } from "./helpers/config.js";
import { getStat } from "./helpers/utils.js";
import { ExtensionPathType } from "./types/index.js";
import path from "path";

export abstract class Loadr {
    static #extensions: Extension[] = [];

    static get displayable() {
        return this.#extensions.map(({ config }) => ({
            ...config,
            main: undefined,
        }));
    }

    static get extensions() {
        return Array.from(this.#extensions);
    }

    static get extensionCount() {
        return this.#extensions.length;
    }

    /**
     * Find extensions in a directory.
     * @param previousExtensions - The previous extensions.
     * @param extensionsPath - The path of the extensions directory.
     */
    static async #findExtensions(
        previousExtensions: Extension[],
        extensionsPath: ExtensionPathType
    ) {
        const stat = await getStat(extensionsPath.directory);

        // Ensure the extensions directory exists
        if (!stat?.isDirectory()) {
            await fs.mkdir(extensionsPath.directory, { recursive: true });
            return;
        }

        // Read all items in the extensions directory
        const items = await fs.readdir(extensionsPath.directory);

        for (const item of items)
            try {
                const extension = await Extension.new(
                    previousExtensions,
                    extensionsPath,
                    item
                );

                if (!extension) continue;

                this.#extensions.push(extension);

                if (Config.log)
                    console.log("Found extension:", extension.extendedName);
            } catch (error) {
                console.error(`Error loading extension ${item}:`, error);
            }
    }

    /**
     * Copy an extension to a destination.
     * @param directory - The directory of the extension to copy.
     * @param extensionsPath - The path of the extensions directory.
     * @returns Promise with operation result and path of the copied extension.
     */
    static async copyExtension(
        directory: string,
        extensionsPath: ExtensionPathType
    ) {
        const stat = await getStat(directory);

        if (!stat)
            return {
                ok: false,
                error: "Directory not found",
            };

        if (!stat.isDirectory())
            return {
                ok: false,
                error: "Path is not a directory",
            };

        const directoryName = path.normalize(directory).split(path.sep).pop();

        if (!directoryName) {
            return {
                ok: false,
                error: "Directory name not found",
            };
        }

        const destinationPath = path.join(
            extensionsPath.directory,
            directoryName
        );

        // Check if destination already exists
        const destinationStat = await getStat(destinationPath);

        if (destinationStat) {
            return {
                ok: false,
                error: "Extension already exists at destination",
            };
        }

        try {
            await fs.cp(directory, destinationPath, {
                recursive: true,
            });
            return {
                ok: true,
                path: destinationPath,
                name: directoryName,
            };
        } catch (error: any) {
            return {
                ok: false,
                error: `Failed to copy directory: ${error.message}`,
            };
        }
    }

    /**
     * Find extensions in the system.
     */
    static async findExtensions() {
        const previousExtensions = this.#extensions;
        this.#extensions = [];

        for (const extensionsPath of Config.extensionsPaths)
            await this.#findExtensions(previousExtensions, extensionsPath);

        if (Config.log)
            console.log(`Found ${this.#extensions.length} extension(s).`);
    }
}
