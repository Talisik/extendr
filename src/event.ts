import { IpcMainInvokeEvent } from "electron";

export class Event {
    readonly name: string;
    readonly returnValue: any;
    readonly invokeEvent?: IpcMainInvokeEvent;
    #stopPropagation: boolean = false;

    constructor(
        name: string,
        returnValue: any,
        ipcMainInvokeEvent?: IpcMainInvokeEvent
    ) {
        this.name = name;
        this.returnValue = returnValue;
        this.invokeEvent = ipcMainInvokeEvent;
    }

    get isStopPropagation() {
        return this.#stopPropagation;
    }

    /**
     * Stop the propagation of the event, preventing other listeners from being called.
     */
    stopPropagation() {
        this.#stopPropagation = true;
    }
}
