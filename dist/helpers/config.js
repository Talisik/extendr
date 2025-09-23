export class Config {
    static extensionsPathOf(name) {
        for (const path of this.extensionsPaths) {
            if (path.name === name)
                return path;
        }
        return null;
    }
}
Config.log = false;
Config.listenerPrefix = "extendr";
