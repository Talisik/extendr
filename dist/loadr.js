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
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _a, _Loadr_extensions, _Loadr_findExtensions;
import fs from "fs/promises";
import { Extension } from "./extension.js";
import { Config } from "./helpers/config.js";
import { getStat } from "./helpers/utils.js";
import path from "path";
export class Loadr {
    static get displayable() {
        return __classPrivateFieldGet(this, _a, "f", _Loadr_extensions).map(({ config }) => (Object.assign(Object.assign({}, config), { main: undefined })));
    }
    static get extensions() {
        return Array.from(__classPrivateFieldGet(this, _a, "f", _Loadr_extensions));
    }
    static get extensionCount() {
        return __classPrivateFieldGet(this, _a, "f", _Loadr_extensions).length;
    }
    static copyExtension(directory, extensionsPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const stat = yield getStat(directory);
            if (!stat)
                return {
                    ok: false,
                    error: "Directory not found",
                };
            if (!stat.isDirectory())
                return {
                    ok: false,
                    error: "Path is not a directory",
                };
            const directoryName = path.normalize(directory).split(path.sep).pop();
            if (!directoryName) {
                return {
                    ok: false,
                    error: "Directory name not found",
                };
            }
            const destinationPath = path.join(extensionsPath.directory, directoryName);
            const destinationStat = yield getStat(destinationPath);
            if (destinationStat) {
                return {
                    ok: false,
                    error: "Extension already exists at destination",
                };
            }
            try {
                yield fs.cp(directory, destinationPath, {
                    recursive: true,
                });
                return {
                    ok: true,
                    path: destinationPath,
                    name: directoryName,
                };
            }
            catch (error) {
                return {
                    ok: false,
                    error: `Failed to copy directory: ${error.message}`,
                };
            }
        });
    }
    static findExtensions() {
        return __awaiter(this, void 0, void 0, function* () {
            const previousExtensions = __classPrivateFieldGet(this, _a, "f", _Loadr_extensions);
            __classPrivateFieldSet(this, _a, [], "f", _Loadr_extensions);
            for (const extensionsPath of Config.extensionsPaths)
                yield __classPrivateFieldGet(this, _a, "m", _Loadr_findExtensions).call(this, previousExtensions, extensionsPath);
            if (Config.log)
                console.log(`Found ${__classPrivateFieldGet(this, _a, "f", _Loadr_extensions).length} extension(s).`);
        });
    }
    static getExtensionModule(name) {
        var _b;
        return (_b = __classPrivateFieldGet(this, _a, "f", _Loadr_extensions).find((extension) => extension.extendedName === name ||
            extension.config.name === name ||
            extension.config.fullpath === name)) === null || _b === void 0 ? void 0 : _b.config.module;
    }
}
_a = Loadr, _Loadr_findExtensions = function _Loadr_findExtensions(previousExtensions, extensionsPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const stat = yield getStat(extensionsPath.directory);
        if (!(stat === null || stat === void 0 ? void 0 : stat.isDirectory())) {
            yield fs.mkdir(extensionsPath.directory, { recursive: true });
            return;
        }
        const items = yield fs.readdir(extensionsPath.directory);
        for (const item of items)
            try {
                const extension = yield Extension.new(previousExtensions, extensionsPath, item);
                if (!extension)
                    continue;
                __classPrivateFieldGet(this, _a, "f", _Loadr_extensions).push(extension);
                if (Config.log)
                    console.log("Found extension:", extension.extendedName);
            }
            catch (error) {
                console.error(`Error loading extension ${item}:`, error);
            }
    });
};
_Loadr_extensions = { value: [] };
