import { Logger, LogLevel} from "@ma3-pro-plugins/ma3-pro-plugins-lib"
import { ImageLibraryInstaller } from "./ImageLibraryInstaller"
import {item, layout} from "./Layoutmaker"

function main(this: void, displayHandle: Display, argument: string) {

    const log = Logger({ prefix: ["PluginTemplate"], logLevel: LogLevel.TRACE })
    log.trace("main(): Plugin started")

    switch (argument) {
        case "install": {
            ImageLibraryInstaller(log).onInstall()
            break
        }
        case "uninstall": {
            ImageLibraryInstaller(log).onUninstall()
            break
        }
    }

}

export default [main]