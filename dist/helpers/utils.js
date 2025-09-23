var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import fs from "fs/promises";
export function getStat(path) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const stat = yield fs.stat(path);
            return stat;
        }
        catch (_a) { }
    });
}
export function binaryInsert(arr, value, selector) {
    let low = 0, high = arr.length;
    while (low < high) {
        const mid = Math.floor((low + high) / 2);
        if (selector(arr[mid]) < selector(value))
            low = mid + 1;
        else
            high = mid;
    }
    arr.splice(low, 0, value);
}
