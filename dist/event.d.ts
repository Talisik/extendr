import { IpcMainInvokeEvent } from "electron";
export declare class Event {
    #private;
    readonly name: string;
    readonly returnValue: any;
    readonly invokeEvent?: IpcMainInvokeEvent;
    constructor(name: string, returnValue: any, ipcMainInvokeEvent?: IpcMainInvokeEvent);
    get isStopPropagation(): boolean;
    stopPropagation(): void;
}
