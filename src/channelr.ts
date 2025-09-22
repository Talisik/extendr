import { ChannelType } from "./types/index.js";
import { v4 as uuidv4 } from "uuid";
import { binaryInsert } from "./helpers/utils.js";

export class Channelr {
    static channels: ChannelType[] = [];

    readonly extensionName: string;

    constructor(extensionName: string) {
        this.extensionName = extensionName;
    }

    register(channelName: string, priority: number = 0) {
        const channelID = uuidv4();

        binaryInsert(
            Channelr.channels,
            {
                extensionName: this.extensionName,
                channelName,
                channelID,
                priority,
            },
            ({ priority }) => priority
        );

        return channelID;
    }

    unregister(channelID: string) {
        Channelr.channels = Channelr.channels.filter(
            (channel) => channel.channelID !== channelID
        );
    }
}
