import { Extension } from "./extension.js";
export declare class LoadOrdr {
    #private;
    static extensions: Extension[];
    static get displayable(): {
        extendedName: string;
        extension: {
            main: undefined;
            name?: string;
            fullpath: string;
            directory: import("./index.js").ExtensionPathType;
            module: {
                [key: string]: any;
            };
            packageJson?: any;
            dependencies: string[];
            valid: boolean;
            reason?: string;
        };
    }[];
    static sort(): void;
    static load(): Promise<void>;
    static save(): Promise<void>;
}
