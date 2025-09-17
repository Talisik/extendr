import { Config } from "./config.js";

export abstract class ChannelNames {
    /**
     * Called when the extension wants to get the info of a video.
     */
    static get GET_INFO() {
        return `${Config.listenerPrefix}:getInfo`;
    }

    static get DOWNLOAD() {
        return `${Config.listenerPrefix}:download`;
    }

    static get KILL_CONTROLLER() {
        return `${Config.listenerPrefix}:killController`;
    }

    static get GET_EXTENSIONS() {
        return `${Config.listenerPrefix}:getExtensions`;
    }

    static get FIND_EXTENSIONS() {
        return `${Config.listenerPrefix}:findExtensions`;
    }

    static get ADD_EXTENSIONS() {
        return `${Config.listenerPrefix}:addExtension`;
    }

    static get GET_EXTENSION_CHANNELS() {
        return `${Config.listenerPrefix}:getExtensionChannels`;
    }

    static get GET_LOAD_ORDER() {
        return `${Config.listenerPrefix}:getLoadOrder`;
    }

    static get SET_LOAD_ORDER() {
        return `${Config.listenerPrefix}:setLoadOrder`;
    }
}
