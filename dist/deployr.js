var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _a, _Deployr_addExtensions, _Deployr_getExtensions, _Deployr_findExtensions, _Deployr_setLoadOrder, _Deployr_getInfo, _Deployr_killController, _Deployr_download, _Deployr_getExtensionChannels;
import { ChannelNames } from "./helpers/channel-names.js";
import { contextBridge, ipcMain, ipcRenderer, } from "electron";
import { EventManagr } from "./event-managr.js";
import { Channelr } from "./channelr.js";
import { BalancedDownloadThrottlr } from "./balanced-download-throttlr.js";
import { LoadOrdr } from "./load-ordr.js";
import { Loadr } from "./loadr.js";
import { Config } from "./helpers/config.js";
import { Extension } from "./extension.js";
import { v4 as uuidv4 } from "uuid";
export class Deployr {
    static setupMain() {
        return __awaiter(this, void 0, void 0, function* () {
            ipcMain.handle(ChannelNames.GET_EXTENSION_CHANNELS, __classPrivateFieldGet(this, _a, "m", _Deployr_getExtensionChannels));
            ipcMain.handle(ChannelNames.ADD_EXTENSIONS, __classPrivateFieldGet(this, _a, "m", _Deployr_addExtensions));
            ipcMain.handle(ChannelNames.FIND_EXTENSIONS, __classPrivateFieldGet(this, _a, "m", _Deployr_findExtensions));
            ipcMain.handle(ChannelNames.GET_EXTENSIONS, __classPrivateFieldGet(this, _a, "m", _Deployr_getExtensions));
            ipcMain.handle(ChannelNames.GET_INFO, __classPrivateFieldGet(this, _a, "m", _Deployr_getInfo));
            ipcMain.handle(ChannelNames.KILL_CONTROLLER, __classPrivateFieldGet(this, _a, "m", _Deployr_killController));
            ipcMain.handle(ChannelNames.DOWNLOAD, __classPrivateFieldGet(this, _a, "m", _Deployr_download));
            ipcMain.handle(ChannelNames.SET_LOAD_ORDER, __classPrivateFieldGet(this, _a, "m", _Deployr_setLoadOrder));
            for (const extension of LoadOrdr.extensions)
                yield extension.loadMain();
        });
    }
    static setupPreload() {
        return __awaiter(this, void 0, void 0, function* () {
            const channels = yield ipcRenderer.invoke(ChannelNames.GET_EXTENSION_CHANNELS);
            const extensions = {};
            for (const { extensionName, channelName, channelID } of channels) {
                if (!(extensionName in extensions))
                    extensions[extensionName] = {};
                extensions[extensionName][channelName] = function (...args) {
                    return __awaiter(this, void 0, void 0, function* () {
                        return yield ipcRenderer.invoke(channelID, ...args);
                    });
                };
            }
            contextBridge.exposeInMainWorld("extendr", {
                addExtensions(directories) {
                    return __awaiter(this, void 0, void 0, function* () {
                        return yield ipcRenderer.invoke(ChannelNames.ADD_EXTENSIONS, directories);
                    });
                },
                findExtensions(extendedNames) {
                    return __awaiter(this, void 0, void 0, function* () {
                        return yield ipcRenderer.invoke(ChannelNames.FIND_EXTENSIONS, extendedNames);
                    });
                },
                getExtensions() {
                    return __awaiter(this, void 0, void 0, function* () {
                        return yield ipcRenderer.invoke(ChannelNames.GET_EXTENSIONS);
                    });
                },
                getInfo(videoUrl) {
                    return __awaiter(this, void 0, void 0, function* () {
                        return yield ipcRenderer.invoke(ChannelNames.GET_INFO, videoUrl);
                    });
                },
                killController(controllerId) {
                    return __awaiter(this, void 0, void 0, function* () {
                        return yield ipcRenderer.invoke(ChannelNames.KILL_CONTROLLER, controllerId);
                    });
                },
                setLoadOrder(loadOrderItems) {
                    return __awaiter(this, void 0, void 0, function* () {
                        return yield ipcRenderer.invoke(ChannelNames.SET_LOAD_ORDER, loadOrderItems);
                    });
                },
                download(payload, callback) {
                    return __awaiter(this, void 0, void 0, function* () {
                        const throttlr = BalancedDownloadThrottlr.self;
                        const result = yield ipcRenderer.invoke(ChannelNames.DOWNLOAD, payload);
                        const { downloadId, controllerId } = result;
                        function startDownload() {
                            return __awaiter(this, void 0, void 0, function* () {
                                try {
                                    throttlr.forceUpdate(downloadId, {
                                        type: "controller",
                                        downloadId,
                                        controllerId,
                                    }, callback);
                                    ipcRenderer.on(downloadId, (event, chunk) => {
                                        var _b;
                                        throttlr.throttleUpdate(downloadId, chunk, callback);
                                        if (((_b = chunk.data) === null || _b === void 0 ? void 0 : _b.status) === "finished") {
                                            ipcRenderer.removeAllListeners(downloadId);
                                            throttlr.cleanup(downloadId);
                                        }
                                    });
                                }
                                catch (error) {
                                    console.error("Error during download:", error);
                                }
                            });
                        }
                        setTimeout(startDownload, 10);
                        return result;
                    });
                },
                extensions,
            });
        });
    }
}
_a = Deployr, _Deployr_addExtensions = function _Deployr_addExtensions(e_1, directories_1) {
    return __awaiter(this, arguments, void 0, function* (e, directories, destination = "local") {
        const extensionsPath = Config.extensionsPathOf(destination);
        if (!extensionsPath)
            return {
                ok: false,
                error: "Destination not found",
            };
        const content = [];
        for (const directory of directories) {
            const copyResult = yield Loadr.copyExtension(directory, extensionsPath);
            if (!copyResult.ok) {
                content.push(copyResult);
                continue;
            }
            try {
                const extension = yield Extension.new(Loadr.extensions, extensionsPath, copyResult.name);
                if (!extension) {
                    content.push({
                        ok: false,
                        error: "Failed to parse extension",
                    });
                    continue;
                }
                Loadr.extensions.push(extension);
            }
            catch (error) {
                console.error(`Error loading extension ${copyResult.name}:`, error);
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
    });
}, _Deployr_getExtensions = function _Deployr_getExtensions() {
    return __awaiter(this, void 0, void 0, function* () {
        return LoadOrdr.displayable;
    });
}, _Deployr_findExtensions = function _Deployr_findExtensions(e) {
    return __awaiter(this, void 0, void 0, function* () {
        yield Loadr.findExtensions();
    });
}, _Deployr_setLoadOrder = function _Deployr_setLoadOrder(e, extendedNames) {
    return __awaiter(this, void 0, void 0, function* () {
        const newExtensions = [];
        try {
            for (const extendedName of extendedNames) {
                const extension = LoadOrdr.extensions.find((extension) => extension.extendedName === extendedName);
                if (!extension)
                    continue;
                newExtensions.push(extension);
            }
            LoadOrdr.extensions = newExtensions;
            yield LoadOrdr.save();
            return { ok: true };
        }
        catch (error) {
            console.error("Error setting load order:", error);
            return {
                ok: false,
                error: error.message,
            };
        }
    });
}, _Deployr_getInfo = function _Deployr_getInfo(invokeEvent, ...args) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield EventManagr.fire({ eventName: ChannelNames.GET_INFO, invokeEvent }, ...args);
    });
}, _Deployr_killController = function _Deployr_killController(invokeEvent, ...args) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield EventManagr.fire({ eventName: ChannelNames.KILL_CONTROLLER, invokeEvent }, ...args);
    });
}, _Deployr_download = function _Deployr_download(invokeEvent, ...args) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield EventManagr.fire({ eventName: ChannelNames.DOWNLOAD, invokeEvent }, uuidv4(), ...args);
    });
}, _Deployr_getExtensionChannels = function _Deployr_getExtensionChannels() {
    return __awaiter(this, void 0, void 0, function* () {
        return Channelr.channels;
    });
};
