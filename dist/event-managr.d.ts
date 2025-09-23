import { IpcMainInvokeEvent } from "electron";
import { ListenrCallbackType } from "./types/index.js";
export declare abstract class EventManagr {
    #private;
    static addListener(eventName: string, callback: ListenrCallbackType, priority: number, once: boolean): void;
    static on(eventName: string, callback: ListenrCallbackType, priority?: number): void;
    static once(eventName: string, callback: ListenrCallbackType, priority?: number): void;
    static remove(eventName: string, callback: ListenrCallbackType): void;
    static fire({ eventName, invokeEvent, }: {
        eventName: string;
        invokeEvent?: IpcMainInvokeEvent;
    }, ...args: any[]): Promise<any>;
}
