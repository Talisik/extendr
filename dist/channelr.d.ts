import { ChannelType } from "./types/index.js";
export declare class Channelr {
    static channels: ChannelType[];
    readonly extensionName: string;
    constructor(extensionName: string);
    register(channelName: string, priority?: number): string;
    unregister(channelID: string): void;
}
