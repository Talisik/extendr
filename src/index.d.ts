/// <reference types="electron" />

import { IpcMainInvokeEvent } from "electron";

// Event system types
export interface Event {
    readonly name: string;
    readonly returnValue: any;
    readonly invokeEvent?: IpcMainInvokeEvent;
    isStopPropagation: boolean;
    stopPropagation(): void;
}

export type ListenrCallbackType = (event: Event, ...args: any[]) => any;

// Extension types
export interface ExtensionPathType {
    /**
     * The directory of the extension.
     */
    directory: string;
    /**
     * The name of the extension.
     */
    name: string;
}

export interface ExtensionType {
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
     * The module of the extension, excluding the `main` function.
     */
    module: {
        [key: string]: any;
    };
    /**
     * Called when the Electron app is ready.
     */
    main?: Function;
    /**
     * The package.json of the extension.
     */
    packageJson?: any;
    /**
     * The required extensions of the extension.
     */
    dependencies: string[];
    /**
     * Whether the extension is valid.
     */
    valid: boolean;
    /**
     * The reason why the extension is not valid.
     */
    reason?: string;
}

// Channel types
export interface ChannelType {
    extensionName: string;
    channelName: string;
    channelID: string;
    priority: number;
}

// Event Manager
export abstract class EventManagr {
    static addListener(
        eventName: string,
        callback: ListenrCallbackType,
        priority: number,
        once: boolean
    ): void;

    static on(
        eventName: string,
        callback: ListenrCallbackType,
        priority?: number
    ): void;

    static once(
        eventName: string,
        callback: ListenrCallbackType,
        priority?: number
    ): void;

    static remove(eventName: string, callback: ListenrCallbackType): void;

    static fire(
        options: {
            eventName: string;
            invokeEvent?: IpcMainInvokeEvent;
        },
        ...args: any[]
    ): Promise<any>;
}

// Channel Manager
export class Channelr {
    static channels: ChannelType[];
    readonly extensionName: string;

    constructor(extensionName: string);
    register(channelName: string, priority?: number): string;
    unregister(channelID: string): void;
}

// Extension class
export class Extension {
    readonly config: ExtensionType;
    module: any;

    constructor(config: ExtensionType, previousExtensions: Extension[]);

    get extendedName(): string;

    loadMain(args: ExtensionContext): Promise<any>;

    static new(
        previousExtensions: Extension[],
        extensionsPath: ExtensionPathType,
        extensionSubPath: string
    ): Promise<Extension | undefined>;
}

// Main args interface for extension main functions
export interface ExtensionContext {
    /**
     * Event manager for inter-extension communication
     */
    events: typeof EventManagr;

    /**
     * Channel manager for IPC communication
     */
    channels: Channelr;

    /**
     * Electron module
     */
    electron: typeof import("electron");

    /**
     * Get an extension by name
     */
    getExtension(name: string): Extension | undefined;

    /**
     * Get an extension's module by name
     */
    getExtensionModule(name: string): any;
}
