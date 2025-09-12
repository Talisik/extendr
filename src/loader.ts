import path from "path";
import fs from "fs/promises";
import { Extension } from "./extension.js";
import { Config } from "./helpers/config.js";
import { getStat } from "./helpers/utils.js";

export abstract class Loader {
    static #extensions: Extension[] = [];

    static get extensions() {
        return Array.from(this.#extensions);
    }

    static get extensionCount() {
        return this.#extensions.length;
    }

    static async #readModule(filepath: string) {
        const stat = await getStat(filepath);

        if (!stat || !stat.isFile()) return;

        const extensionModule = await import(filepath);

        if (typeof extensionModule.main === "function") return extensionModule;
    }

    static async #loadExtension(directory: string) {
        const fullpath = path.join(Config.extensionsPath, directory);
        const stats = await getStat(fullpath);

        if (!stats || !stats.isDirectory()) return;

        // Look for package.json to find the main entry point
        const packageJsonPath = path.join(fullpath, "package.json");

        const stat = await getStat(packageJsonPath);

        if (stat && stat.isFile()) {
            const packageJson = JSON.parse(
                await fs.readFile(packageJsonPath, "utf8")
            );
            const { name, main: mainFile = "index.js" } = packageJson;

            const module = await this.#readModule(
                path.join(fullpath, mainFile)
            );

            if (module)
                return new Extension({
                    name,
                    packageJson,
                    main: module.main,
                    path: fullpath,
                    valid: true,
                });

            return new Extension({
                name,
                packageJson,
                path: fullpath,
                valid: false,
                reason: `Main file not found: ${mainFile}`,
            });
        }

        // Try to load index.js as fallback
        const module = await this.#readModule(path.join(fullpath, "index.js"));

        if (module)
            return new Extension({
                main: module.main,
                path: fullpath,
                valid: true,
            });

        return new Extension({
            path: fullpath,
            valid: false,
            reason: `Main file not found: index.js`,
        });
    }

    static async findExtensions() {
        this.#extensions = [];

        const stat = await getStat(Config.extensionsPath);

        // Ensure the extensions directory exists
        if (!stat?.isDirectory()) {
            await fs.mkdir(Config.extensionsPath, { recursive: true });
            return;
        }

        // Read all items in the extensions directory
        const items = await fs.readdir(Config.extensionsPath);

        console.log(`Found ${items.length} extension(s).`);

        for (const item of items)
            try {
                const extension = await this.#loadExtension(item);

                if (extension) this.#extensions.push(extension);
            } catch (error) {
                console.error(`Error loading extension ${item}:`, error);
            }
    }
}
