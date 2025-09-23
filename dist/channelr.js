import { v4 as uuidv4 } from "uuid";
import { binaryInsert } from "./helpers/utils.js";
export class Channelr {
    constructor(extensionName) {
        this.extensionName = extensionName;
    }
    register(channelName, priority = 0) {
        const channelID = uuidv4();
        binaryInsert(Channelr.channels, {
            extensionName: this.extensionName,
            channelName,
            channelID,
            priority,
        }, ({ priority }) => priority);
        return channelID;
    }
    unregister(channelID) {
        Channelr.channels = Channelr.channels.filter((channel) => channel.channelID !== channelID);
    }
}
Channelr.channels = [];
