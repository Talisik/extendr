import { EventManagr } from "./event-managr.js";
import { ExtensionPathType, ExtensionType } from "./types/index.js";
import { getStat } from "./helpers/utils.js";
import * as electron from "electron";
import path from "path";
import fs from "fs/promises";
import { Channelr } from "./channelr.js";
import { pathToFileURL } from "url";
import { Config } from "./helpers/config.js";

export class Extension {
    readonly config: ExtensionType;

    /**
     * Whether the main function of the extension has been loaded.
     */
    #mainLoaded: boolean;

    constructor(config: ExtensionType, previousExtensions: Extension[]) {
        this.config = config;
        this.#mainLoaded = previousExtensions.some(
            (extension) => extension.extendedName === this.extendedName
        );
    }

    /**
     * The extended name of the extension.
     * Example: "local:youtube-dl:youtube-dl"
     */
    get extendedName() {
        const directory = path
            .normalize(this.config.fullpath)
            .split(path.sep)
            .pop();

        return `${this.config.directory.name}:${directory}:${this.config.name}`;
    }

    async loadMain() {
        if (!this.config.valid) return;

        if (this.#mainLoaded) return;

        if (!this.config.main) return;

        const result = await this.config.main?.({
            events: EventManagr,
            channels: new Channelr(this.config.name!),
            electron,
        });

        this.#mainLoaded = true;

        if (Config.log) console.log("Loaded extension:", this.extendedName);

        return result;
    }

    static async #readModule(filepath: string) {
        const stat = await getStat(filepath);

        if (!stat || !stat.isFile()) return;

        const extensionModule = await import(pathToFileURL(filepath).href);

        if (typeof extensionModule.main === "function") return extensionModule;
    }

    static async new(
        previousExtensions: Extension[],
        extensionsPath: ExtensionPathType,
        extensionSubPath: string
    ) {
        const fullpath = path.join(extensionsPath.directory, extensionSubPath);
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
            const main = module?.main;

            delete module?.main;

            return new Extension(
                {
                    name,
                    packageJson,
                    module,
                    main,
                    fullpath,
                    directory: extensionsPath,
                    valid: true,
                },
                previousExtensions
            );
        }

        // Try to load index.js as fallback
        const module = await this.#readModule(path.join(fullpath, "index.js"));
        const main = module?.main;

        delete module?.main;

        return new Extension(
            {
                module,
                main,
                fullpath,
                directory: extensionsPath,
                valid: true,
            },
            previousExtensions
        );
    }
}
