import { Extension } from "./extension.js";
import { ExtensionPathType } from "./types/index.js";
export declare abstract class Loadr {
    #private;
    static get extensions(): Extension[];
    static get extensionCount(): number;
    static copyExtension(directory: string, extensionsPath: ExtensionPathType): Promise<{
        ok: boolean;
        error: string;
        path?: undefined;
        name?: undefined;
    } | {
        ok: boolean;
        path: string;
        name: string;
        error?: undefined;
    }>;
    static findExtensions(): Promise<void>;
    static getExtensionModule(name: string): {
        [key: string]: any;
    } | undefined;
}
