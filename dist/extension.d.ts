import { ExtensionPathType, ExtensionType } from "./types/index.js";
export declare class Extension {
    #private;
    readonly config: ExtensionType;
    constructor(config: ExtensionType, previousExtensions: Extension[]);
    get extendedName(): string;
    loadMain(): Promise<any>;
    static new(previousExtensions: Extension[], extensionsPath: ExtensionPathType, extensionSubPath: string): Promise<Extension | undefined>;
}
