import { Event } from "../event.js";

export type ExtensionType = {
    /**
     * The name of the extension.
     */
    name?: string;
    /**
     * The full path of the extension.
     */
    fullpath: string;
    /**
     * The directory of the extension.
     */
    directory: ExtensionPathType;
    /**
     * The module of the extension,
     * excluding the `main` function.
     */
    module: {
        [key: string]: any;
    };
    /**
     * Called before the Electron app is ready.
     */
    main?: Function;
    /**
     * Called when the Electron app is ready.
     */
    ready?: Function;
    /**
     * The package.json of the extension.
     */
    packageJson?: any;
    /**
     * Whether the extension is valid.
     */
    valid: boolean;
    /**
     * The reason why the extension is not valid.
     */
    reason?: string;
};

export type ListenrCallbackType = (event: Event, ...args: any[]) => any;

export type ListenrType = {
    /**
     * The priority of the listener. Lower priority listeners are called first.
     */
    priority: number;
    /**
     * Whether the listener is once.
     */
    once: boolean;
    /**
     * The callback of the listener.
     */
    callback: ListenrCallbackType;
};

export type ExtensionPathType = {
    /**
     * The directory of the extension.
     */
    directory: string;
    /**
     * The name of the extension.
     */
    name: string;
};

export type ChannelType = {
    extensionName: string;
    channelName: string;
    channelID: string;
    priority: number;
};
