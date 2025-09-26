import { Extension } from "./extension.js";
export declare class LoadOrdr {
    #private;
    static extensions: Extension[];
    static get displayable(): {
        priority: number;
        active: boolean;
        module: undefined;
        main: undefined;
        name?: string;
        version?: string;
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
