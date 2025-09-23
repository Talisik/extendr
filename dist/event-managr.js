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
var _a, _EventManagr_listeners;
import { Event } from "./event.js";
import { Config } from "./helpers/config.js";
import { binaryInsert } from "./helpers/utils.js";
export class EventManagr {
    static addListener(eventName, callback, priority, once) {
        if (!__classPrivateFieldGet(this, _a, "f", _EventManagr_listeners).has(eventName)) {
            __classPrivateFieldGet(this, _a, "f", _EventManagr_listeners).set(eventName, []);
        }
        const listeners = __classPrivateFieldGet(this, _a, "f", _EventManagr_listeners).get(eventName);
        const listener = { priority, once, callback };
        binaryInsert(listeners, listener, ({ priority }) => priority);
        if (Config.log)
            console.log("Added listener for event:", eventName, priority, once, listeners.length);
    }
    static on(eventName, callback, priority = 0) {
        return this.addListener(eventName, callback, priority, false);
    }
    static once(eventName, callback, priority = 0) {
        return this.addListener(eventName, callback, priority, true);
    }
    static remove(eventName, callback) {
        if (!__classPrivateFieldGet(this, _a, "f", _EventManagr_listeners).has(eventName)) {
            return;
        }
        const listeners = __classPrivateFieldGet(this, _a, "f", _EventManagr_listeners).get(eventName);
        listeners
            .filter((listener) => listener.callback === callback)
            .forEach((listener) => {
            listeners.splice(listeners.indexOf(listener), 1);
        });
        if (Config.log)
            console.log("Removed listener for event:", eventName, listeners.length);
    }
    static fire(_b) {
        return __awaiter(this, arguments, void 0, function* ({ eventName, invokeEvent, }, ...args) {
            if (Config.log)
                console.log("Firing Event:", eventName, args);
            if (!__classPrivateFieldGet(this, _a, "f", _EventManagr_listeners).has(eventName)) {
                if (Config.log)
                    console.log("No listeners for event:", eventName);
                return;
            }
            let returnValue = undefined;
            const listeners = __classPrivateFieldGet(this, _a, "f", _EventManagr_listeners).get(eventName);
            if (Config.log)
                console.log("Listeners for event:", eventName, listeners.length);
            for (const listener of Array.from(listeners)) {
                const e = new Event(eventName, returnValue, invokeEvent);
                const newReturnValue = yield listener.callback(e, ...args);
                if (newReturnValue !== undefined)
                    returnValue = newReturnValue;
                if (listener.once) {
                    listeners.splice(listeners.indexOf(listener), 1);
                }
                if (e.isStopPropagation)
                    break;
            }
            return returnValue;
        });
    }
}
_a = EventManagr;
_EventManagr_listeners = { value: new Map() };
