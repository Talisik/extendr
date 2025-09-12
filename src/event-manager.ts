import { Config } from "./helpers/config.js";
import { ListenerCallbackType, ListenerType } from "./helpers/types.js";

export abstract class EventManager {
    static #listeners: Map<string, ListenerType[]> = new Map();

    private static binaryInsert(arr: ListenerType[], value: ListenerType) {
        let low = 0,
            high = arr.length;

        while (low < high) {
            const mid = Math.floor((low + high) / 2);

            if (arr[mid]!.priority < value.priority) low = mid + 1;
            else high = mid;
        }

        arr.splice(low, 0, value);
    }

    static addListener(
        eventName: string,
        callback: ListenerCallbackType,
        priority: number,
        once: boolean
    ) {
        if (!this.#listeners.has(eventName)) {
            this.#listeners.set(eventName, []);
        }

        const listeners = this.#listeners.get(eventName);
        const listener = { priority, once, callback };

        this.binaryInsert(listeners!, listener);

        if (Config.log)
            console.log(
                "Added listener for event:",
                eventName,
                priority,
                once,
                listeners!.length
            );
    }

    /**
     * Add a listener to the event manager. Lowest number is called first.
     * @param eventName - The name of the event
     * @param priority - The priority of the listener
     */
    static on(
        eventName: string,
        callback: ListenerCallbackType,
        priority: number = 0
    ) {
        return this.addListener(eventName, callback, priority, false);
    }

    /**
     * Add a listener to the event manager. Lowest number is called first. Will be removed after being called.
     * @param eventName - The name of the event
     * @param priority - The priority of the listener
     */
    static once(
        eventName: string,
        callback: ListenerCallbackType,
        priority: number = 0
    ) {
        return this.addListener(eventName, callback, priority, true);
    }

    /**
     * Remove a listener from the event manager.
     * @param eventName - The name of the event
     * @param callback - The callback of the listener
     */
    static remove(eventName: string, callback: ListenerCallbackType) {
        if (!this.#listeners.has(eventName)) {
            return;
        }

        const listeners = this.#listeners.get(eventName);

        listeners!
            .filter((listener) => listener.callback === callback)
            .forEach((listener) => {
                listeners!.splice(listeners!.indexOf(listener), 1);
            });

        if (Config.log)
            console.log(
                "Removed listener for event:",
                eventName,
                listeners!.length
            );
    }

    /**
     * Fire an event.
     * @param eventName - The name of the event
     * @param args - The arguments to be passed to the event
     */
    static async fire(eventName: string, ...args: any[]) {
        if (Config.log) console.log("Firing Event:", eventName, args);

        if (!this.#listeners.has(eventName)) {
            if (Config.log) console.log("No listeners for event:", eventName);
            return;
        }

        let returnValue = undefined;
        const listeners = this.#listeners.get(eventName);

        if (Config.log)
            console.log("Listeners for event:", eventName, listeners!.length);

        for (const listener of Array.from(listeners!)) {
            returnValue = await listener.callback(args, returnValue);

            if (listener.once) {
                listeners!.splice(listeners!.indexOf(listener), 1);
            }
        }

        return returnValue;
    }
}
