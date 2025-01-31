import { Logger, LogLevel, applyObjProps, applyObjPropsWithDefaults } from "@ma3-pro-plugins/ma3-pro-plugins-lib"
import { ImageLibraryInstaller } from "./ImageLibraryInstaller"
import {item, layout} from "./Layoutmaker"

function main(this: void, displayHandle: Display, argument: string) {

    const log = Logger({ prefix: ["PluginTemplate"], logLevel: LogLevel.TRACE })
    log.trace("main(): Plugin started")

    switch (argument) {
        case "install": {
            DataPool()[10][1].yGroup = 3
            log.trace("Yvalue was adjusted")
            let layout_ = new layout(200);
            layout_.additem("test", 12);
            layout_.addcol();
            break
        }
        case "uninstall": {
            ImageLibraryInstaller(log).onUninstall()
            break
        }
    }

}

export default [main]