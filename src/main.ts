import { Logger, LogLevel} from "@ma3-pro-plugins/ma3-pro-plugins-lib"
import { ImageLibraryInstaller } from "./ImageLibraryInstaller"
import {clearprogrammer, create_positions, engine, trackerfromstring, item, layout, presets, tracker} from "./Layoutmaker"
import { command } from "ftp"

let engines: Array<engine> = [];

function main(this: void, displayHandle: Display, argument: string) {

    const log = Logger({ prefix: ["PluginTemplate"], logLevel: LogLevel.TRACE })
    log.trace("main(): Plugin started")

    if (GetVar(UserVars(), "POS_ENGINE_INSTALLED")){
        switch (argument) {
            case "uninstall": {
                ImageLibraryInstaller(log).onUninstall()
                break
            }
            case "startshow": { // objects should be loaded here

            }
            case null: {
                    
                let options = {
                    title: "Setup",
                    commands: [
                        {value: 0, name: "Cancel"},
                        {value: 1, name: "Update"},
                    ],
                    inputs: [
                        {name: "Group 1 Linear", value: "gr1"},
                        {name: "Group 1 Grid", value: "gr2"},
                        {name: "Group 2 Linear", value:"gr3"},
                        {name: "Group 2 Grid", value:"gr4"}
                    ]
                }
                let input = MessageBox(options)
                
                log.trace("main(): Creating empty engines")
                let engines: Array<engine> = [new engine(1), new engine(2)];

                log.trace("main(): Assigning groups to engines")
                if (input.result == 1) {
                    Object.keys(input.inputs).forEach((e) => {
                        if ((input.inputs[e] && e)){
                            let index = parseFloat(e.split(" ")[1]);
                            engines[index-1].engine_num = parseFloat(input.inputs[e])
                        }
                    });
                    let track = trackerfromstring(GetVar(UserVars(), "POS_ENGINE_TRACKER"))
                    
                    engines.forEach(e => {
                        e.create_engine(track, preset)
                    })
                }
            break  
            }
        }
    }else{
        log.trace("main(): Starting installation");
        log.trace("main(): Clearing programmer");
        clearprogrammer();
        log.trace("main(): Install images");
        ImageLibraryInstaller(log).onInstall();
        log.trace("main(): prepeare objects");
        let track = new tracker(100, 100, 100);
        let preset = new presets();
        log.trace("main(): Create engines");
        create_positions(track, preset);
        SetVar(UserVars(), "POS_ENGINE_TRACKER", track.tostring());
        SetVar(UserVars(),"POS_ENGINE_PRESET", preset.tostring());
        SetVar(UserVars(), "POS_ENGINE_INSTALLED", true)
        log.trace("main(): Engines prepared and ready for initialization")
    }
}

export default [main]