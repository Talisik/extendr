import { Event } from "../event.js";
export type ExtensionType = {
    name?: string;
    version?: string;
    fullpath: string;
    directory: ExtensionPathType;
    module: {
        [key: string]: any;
    };
    main?: Function;
    packageJson?: any;
    dependencies: string[];
    valid: boolean;
    reason?: string;
};
export type ListenrCallbackType = (event: Event, ...args: any[]) => any;
export type ListenrType = {
    priority: number;
    once: boolean;
    callback: ListenrCallbackType;
};
export type ExtensionPathType = {
    directory: string;
    name: string;
};
export type ChannelType = {
    extensionName: string;
    channelName: string;
    channelID: string;
    priority: number;
};
