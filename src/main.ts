import { Logger, LogLevel} from "@ma3-pro-plugins/ma3-pro-plugins-lib"
import { ImageLibraryInstaller } from "./ImageLibraryInstaller"
import {engine, item, layout} from "./Layoutmaker"
import { command } from "ftp"

let engines = [];

function main(this: void, displayHandle: Display, argument: string) {

    const log = Logger({ prefix: ["PluginTemplate"], logLevel: LogLevel.TRACE })
    log.trace("main(): Plugin started")

    switch (argument) {
        case "install": {
            ImageLibraryInstaller(log).onInstall()

            for (let i = 0; i<2; i++){
                engines.push(new engine(i+1))
            }
            log.trace("main(): Engines prepared and ready for initialization")
            break
        }
        case "uninstall": {
            ImageLibraryInstaller(log).onUninstall()
            break
        }
        case "edit": {
            let options = {
                title: "Setup",
                commands: [
                    {value: 0, name: "Cancel"},
                    {value: 1, name: "Update"}
                ],
                inputs: [
                    {name: "Group 1 Linear", value: "gr1"},
                    {name: "Group 1 Grid", value: "gr2"},
                    {name: "Group 2 Linear", value:"gr3"},
                    {name: "Group 2 Grid", value:"gr4"}


                ]
            }
            let input = MessageBox(options)
            if (input.result == 1) {
                log.trace(input.inputs["Group 1 Linear"])
            }
            
        }
    }

}

export default [main]