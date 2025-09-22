import { ExtensionPathType } from "../types/index.js";

export abstract class Config {
    static log: boolean = false;
    static extensionsPaths: ExtensionPathType[];
    static loadOrderPath: string;
    static listenerPrefix = "extendr";

    static extensionsPathOf(name: string) {
        for (const path of this.extensionsPaths) {
            if (path.name === name) return path;
        }

        return null;
    }
}
