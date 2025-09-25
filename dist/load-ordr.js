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
var _a, _LoadOrdr_findExtension;
import path from "path";
import fs from "fs/promises";
import { Extension } from "./extension.js";
import { Config } from "./helpers/config.js";
import { Loadr } from "./loadr.js";
import { getStat } from "./helpers/utils.js";
export class LoadOrdr {
    static get displayable() {
        return this.extensions.map((item) => ({
            extendedName: item.extendedName,
            extension: Object.assign(Object.assign({}, item.config), { main: undefined }),
        }));
    }
    static sort() {
        this.extensions = this.extensions.sort((a, b) => {
            if (a.config.dependencies.includes(b.config.name))
                return 1;
            if (b.config.dependencies.includes(a.config.name))
                return -1;
            return 0;
        });
    }
    static load() {
        return __awaiter(this, void 0, void 0, function* () {
            const stat = yield getStat(Config.loadOrderPath);
            if (!stat || stat.isDirectory())
                return;
            const data = yield fs.readFile(Config.loadOrderPath, "utf8");
            const items = JSON.parse(data);
            this.extensions = items.map((extendedName) => {
                var _b;
                return (_b = __classPrivateFieldGet(this, _a, "m", _LoadOrdr_findExtension).call(this, extendedName)) !== null && _b !== void 0 ? _b : new Extension({
                    name: extendedName,
                    fullpath: "",
                    module: {},
                    directory: {
                        name: extendedName.split(":")[0],
                        directory: "",
                    },
                    valid: false,
                    reason: "Extension not found",
                    dependencies: [],
                }, []);
            });
            if (Config.log) {
                const valid = this.extensions.filter((item) => item.config.valid);
                console.log(`Loaded ${this.extensions.length} extension(s) in load order,`, `where ${valid.length} are valid.`);
            }
        });
    }
    static save() {
        return __awaiter(this, void 0, void 0, function* () {
            const stat = yield getStat(Config.loadOrderPath);
            if (!stat || !stat.isDirectory())
                yield fs.mkdir(path
                    .normalize(Config.loadOrderPath)
                    .split(path.sep)
                    .slice(0, -1)
                    .join(path.sep), {
                    recursive: true,
                });
            yield fs.writeFile(Config.loadOrderPath, JSON.stringify(this.extensions));
        });
    }
}
_a = LoadOrdr, _LoadOrdr_findExtension = function _LoadOrdr_findExtension(extendedName) {
    const [extensionsName, extensionFolderName, extensionName] = extendedName.split(":");
    const extensionsPath = Config.extensionsPathOf(extensionsName);
    if (!extensionsPath)
        return;
    const fullpath = path.join(extensionsPath.directory, extensionFolderName);
    return Loadr.extensions.find((extension) => extension.config.name === extensionName &&
        extension.config.fullpath === fullpath);
};
LoadOrdr.extensions = [];
