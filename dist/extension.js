var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _a, _Extension_mainLoaded, _Extension_readModule;
import { EventManagr } from "./event-managr.js";
import { getStat } from "./helpers/utils.js";
import * as electron from "electron";
import path from "path";
import fs from "fs/promises";
import { Channelr } from "./channelr.js";
import { pathToFileURL } from "url";
import { Config } from "./helpers/config.js";
import { EXT_DEPENDENCIES } from "./helpers/constants.js";
export class Extension {
    constructor(config, previousExtensions) {
        _Extension_mainLoaded.set(this, void 0);
        this.config = config;
        __classPrivateFieldSet(this, _Extension_mainLoaded, previousExtensions.some((extension) => extension.extendedName === this.extendedName), "f");
    }
    get extendedName() {
        const directory = path
            .normalize(this.config.fullpath)
            .split(path.sep)
            .pop();
        return `${this.config.directory.name}:${directory}:${this.config.name}`;
    }
    loadMain() {
        return __awaiter(this, void 0, void 0, function* () {
            var _b, _c;
            if (!this.config.valid)
                return;
            if (__classPrivateFieldGet(this, _Extension_mainLoaded, "f"))
                return;
            if (!this.config.main)
                return;
            const result = yield ((_c = (_b = this.config).main) === null || _c === void 0 ? void 0 : _c.call(_b, {
                events: EventManagr,
                channels: new Channelr(this.config.name),
                electron,
            }));
            __classPrivateFieldSet(this, _Extension_mainLoaded, true, "f");
            if (Config.log)
                console.log("Loaded extension:", this.extendedName);
            return result;
        });
    }
    static new(previousExtensions, extensionsPath, extensionSubPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const fullpath = path.join(extensionsPath.directory, extensionSubPath);
            const stats = yield getStat(fullpath);
            if (!stats || !stats.isDirectory())
                return;
            const packageJsonPath = path.join(fullpath, "package.json");
            const stat = yield getStat(packageJsonPath);
            if (stat && stat.isFile()) {
                const packageJson = JSON.parse(yield fs.readFile(packageJsonPath, "utf8"));
                const { name, main: mainFile = "index.js" } = packageJson;
                const module = yield __classPrivateFieldGet(this, _a, "m", _Extension_readModule).call(this, path.join(fullpath, mainFile));
                const main = module === null || module === void 0 ? void 0 : module.main;
                return new _a({
                    name,
                    version: packageJson.version,
                    packageJson,
                    module,
                    main,
                    fullpath,
                    directory: extensionsPath,
                    valid: true,
                    dependencies: packageJson[EXT_DEPENDENCIES] || [],
                }, previousExtensions);
            }
            const module = yield __classPrivateFieldGet(this, _a, "m", _Extension_readModule).call(this, path.join(fullpath, "index.js"));
            const main = module === null || module === void 0 ? void 0 : module.main;
            return new _a({
                module,
                main,
                fullpath,
                directory: extensionsPath,
                valid: true,
                dependencies: [],
            }, previousExtensions);
        });
    }
}
_a = Extension, _Extension_mainLoaded = new WeakMap(), _Extension_readModule = function _Extension_readModule(filepath) {
    return __awaiter(this, void 0, void 0, function* () {
        const stat = yield getStat(filepath);
        if (!stat || !stat.isFile())
            return;
        return yield import(pathToFileURL(filepath).href);
    });
};
