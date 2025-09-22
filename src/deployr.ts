import { ChannelNames } from "./helpers/channel-names.js";
import {
    contextBridge,
    ipcMain,
    IpcMainInvokeEvent,
    ipcRenderer,
} from "electron";
import { EventManagr } from "./event-managr.js";
import { Channelr } from "./channelr.js";
import { ChannelType } from "./types/index.js";
import { BalancedDownloadThrottlr } from "./balanced-download-throttlr.js";
import { LoadOrdr } from "./load-ordr.js";
import { Loadr } from "./loadr.js";
import { Config } from "./helpers/config.js";
import { Extension } from "./extension.js";
import { v4 as uuidv4 } from "uuid";

export abstract class Deployr {
    static async #addExtensions(
        e: IpcMainInvokeEvent,
        directories: string[],
        destination: string = "local"
    ) {
        const extensionsPath = Config.extensionsPathOf(destination);

        if (!extensionsPath)
            return {
                ok: false,
                error: "Destination not found",
            };

        const content = [];

        for (const directory of directories) {
            const copyResult = await Loadr.copyExtension(
                directory,
                extensionsPath
            );

            if (!copyResult.ok) {
                content.push(copyResult);
                continue;
            }

            try {
                const extension = await Extension.new(
                    Loadr.extensions,
                    extensionsPath,
                    copyResult.name!
                );

                if (!extension) {
                    content.push({
                        ok: false,
                        error: "Failed to parse extension",
                    });
                    continue;
                }

                Loadr.extensions.push(extension);
            } catch (error: any) {
                console.error(
                    `Error loading extension ${copyResult.name}:`,
                    error
                );

                content.push({
                    ok: false,
                    error: `Failed to load extension ${copyResult.name}: ${error.message}`,
                });
            }
        }

        return {
            ok: true,
            content,
        };
    }

    static async #getExtensions() {
        return Loadr.displayable;
    }

    static async #findExtensions(e: IpcMainInvokeEvent) {
        await Loadr.findExtensions();
    }

    static async #getLoadOrder() {
        return LoadOrdr.displayable;
    }

    static async #setLoadOrder(e: IpcMainInvokeEvent, extendedNames: string[]) {
        LoadOrdr.extensions = [];

        try {
            for (const extendedName of extendedNames) {
                const extension = LoadOrdr.extensions.find(
                    (existingItem) => existingItem.extendedName === extendedName
                );

                if (!extension) continue;

                LoadOrdr.extensions.push(extension);
            }

            // Save the updated load order to file
            await LoadOrdr.save();

            return { ok: true };
        } catch (error: any) {
            console.error("Error setting load order:", error);

            return {
                ok: false,
                error: error.message,
            };
        }
    }

    static async #getInfo(invokeEvent: IpcMainInvokeEvent, ...args: any[]) {
        return await EventManagr.fire(
            { eventName: ChannelNames.GET_INFO, invokeEvent },
            ...args
        );
    }

    static async #killController(
        invokeEvent: IpcMainInvokeEvent,
        ...args: any[]
    ) {
        return await EventManagr.fire(
            { eventName: ChannelNames.KILL_CONTROLLER, invokeEvent },
            ...args
        );
    }

    static async #download(invokeEvent: IpcMainInvokeEvent, ...args: any[]) {
        return await EventManagr.fire(
            { eventName: ChannelNames.DOWNLOAD, invokeEvent },
            uuidv4(),
            ...args
        );
    }

    static async #getExtensionChannels() {
        return Channelr.channels;
    }

    static async setupMain() {
        ipcMain.handle(
            ChannelNames.GET_EXTENSION_CHANNELS,
            this.#getExtensionChannels
        );
        ipcMain.handle(ChannelNames.ADD_EXTENSIONS, this.#addExtensions);
        ipcMain.handle(ChannelNames.FIND_EXTENSIONS, this.#findExtensions);
        ipcMain.handle(ChannelNames.GET_EXTENSIONS, this.#getExtensions);
        ipcMain.handle(ChannelNames.GET_INFO, this.#getInfo);
        ipcMain.handle(ChannelNames.KILL_CONTROLLER, this.#killController);
        ipcMain.handle(ChannelNames.DOWNLOAD, this.#download);
        ipcMain.handle(ChannelNames.GET_LOAD_ORDER, this.#getLoadOrder);
        ipcMain.handle(ChannelNames.SET_LOAD_ORDER, this.#setLoadOrder);

        for (const extension of LoadOrdr.extensions) await extension.loadMain();
    }

    static async setupPreload() {
        const channels: ChannelType[] = await ipcRenderer.invoke(
            ChannelNames.GET_EXTENSION_CHANNELS
        );

        const extensions: {
            [key: string]: any;
        } = {};

        for (const { extensionName, channelName, channelID } of channels) {
            if (!(extensionName in extensions)) extensions[extensionName] = {};

            extensions[extensionName][channelName] = async function (
                ...args: any[]
            ) {
                return await ipcRenderer.invoke(channelID, ...args);
            };
        }

        contextBridge.exposeInMainWorld("extendr", {
            async addExtensions(directories: string[]) {
                return await ipcRenderer.invoke(
                    ChannelNames.ADD_EXTENSIONS,
                    directories
                );
            },

            async findExtensions(extendedNames: string[]) {
                return await ipcRenderer.invoke(
                    ChannelNames.FIND_EXTENSIONS,
                    extendedNames
                );
            },

            async getExtensions() {
                return await ipcRenderer.invoke(ChannelNames.GET_EXTENSIONS);
            },

            async getInfo(videoUrl: string) {
                return await ipcRenderer.invoke(
                    ChannelNames.GET_INFO,
                    videoUrl
                );
            },

            async killController(controllerId: string) {
                return await ipcRenderer.invoke(
                    ChannelNames.KILL_CONTROLLER,
                    controllerId
                );
            },

            async getLoadOrder() {
                return await ipcRenderer.invoke(ChannelNames.GET_LOAD_ORDER);
            },

            async setLoadOrder(loadOrderItems: any[]) {
                return await ipcRenderer.invoke(
                    ChannelNames.SET_LOAD_ORDER,
                    loadOrderItems
                );
            },

            async download(payload: any, callback: (args: any) => void) {
                const throttlr = BalancedDownloadThrottlr.self;
                const result = await ipcRenderer.invoke(
                    ChannelNames.DOWNLOAD,
                    payload
                );
                const { downloadId, controllerId } = result;

                async function startDownload() {
                    try {
                        // Controller data is critical, send immediately
                        throttlr.forceUpdate(
                            downloadId,
                            {
                                type: "controller",
                                downloadId,
                                controllerId,
                            },
                            callback
                        );

                        ipcRenderer.on(downloadId, (event, chunk) => {
                            // Use balanced throttling for all updates
                            throttlr.throttleUpdate(
                                downloadId,
                                chunk,
                                callback
                            );

                            // Clean up on finish
                            if (chunk.data?.status === "finished") {
                                ipcRenderer.removeAllListeners(downloadId);
                                throttlr.cleanup(downloadId);
                            }
                        });
                    } catch (error) {
                        console.error("Error during download:", error);
                    }
                }

                // Delay the start of the download to allow the controller to be set up.
                setTimeout(startDownload, 10);

                return result;
            },

            extensions,
        });
    }
}
