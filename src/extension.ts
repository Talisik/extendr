import { EventManager } from "./event-manager.js";
import { ExtensionType } from "./helpers/types.js";

export class Extension {
    readonly config: ExtensionType;

    #loaded: boolean = false;

    constructor(config: ExtensionType) {
        this.config = config;
    }

    load() {
        if (!this.config.valid) return;

        if (this.#loaded) return;

        this.config.main!({
            events: EventManager,
        });

        this.#loaded = true;
    }
}
