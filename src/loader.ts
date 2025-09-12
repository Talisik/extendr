import path from "path";
import fs from "fs";
import Extension from "./extension.js";
import { Config } from "./config.js";

export default abstract class Loader {
    static #extensions: Extension[] = [];

    static get extensions() {
        return Array.from(this.#extensions);
    }

    static get extensionCount() {
        return this.#extensions.length;
    }

    static #readModule(filepath: string) {
        if (!fs.existsSync(filepath)) return;

        const extensionModule = require(filepath);

        if (typeof extensionModule.main === "function") return extensionModule;
    }

    static #loadExtension(directory: string) {
        const fullpath = path.join(Config.extensionsPath, directory);
        const stats = fs.statSync(fullpath);

        if (!stats.isDirectory()) return;

        // Look for package.json to find the main entry point
        const packageJsonPath = path.join(fullpath, "package.json");

        if (fs.existsSync(packageJsonPath)) {
            const packageJson = JSON.parse(
                fs.readFileSync(packageJsonPath, "utf8")
            );
            const { name, main: mainFile = "index.js" } = packageJson;

            const module = this.#readModule(path.join(fullpath, mainFile));

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
        const module = this.#readModule(path.join(fullpath, "index.js"));

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

    static #findExtensions() {
        this.#extensions = [];

        // Ensure the extensions directory exists
        if (!fs.existsSync(Config.extensionsPath)) {
            fs.mkdirSync(Config.extensionsPath, { recursive: true });
            return;
        }

        // Read all items in the extensions directory
        const items = fs.readdirSync(Config.extensionsPath);

        console.log(`Found ${items.length} extension(s).`);

        for (const item of items)
            try {
                const extension = this.#loadExtension(item);

                if (extension) this.#extensions.push(extension);
            } catch (error) {
                console.error(`Error loading extension ${item}:`, error);
            }
    }
}
