import { Extension } from "./extension.js";
export declare class LoadOrdr {
    #private;
    static extensions: Extension[];
    static get displayable(): {
        extendedName: string;
        priority: number;
        active: boolean;
        module: undefined;
        main: undefined;
        name?: string;
        fullpath: string;
        directory: import("./index.js").ExtensionPathType;
        packageJson?: any;
        dependencies: string[];
        valid: boolean;
        reason?: string;
    }[];
    static sort(): void;
    static load(): Promise<void>;
    static save(): Promise<void>;
}
