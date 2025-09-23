import { ExtensionPathType } from "../types/index.js";
export declare abstract class Config {
    static log: boolean;
    static extensionsPaths: ExtensionPathType[];
    static loadOrderPath: string;
    static listenerPrefix: string;
    static extensionsPathOf(name: string): ExtensionPathType | null;
}
