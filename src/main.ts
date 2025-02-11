import { Logger, LogLevel} from "@ma3-pro-plugins/ma3-pro-plugins-lib"
import { ImageLibraryInstaller } from "./ImageLibraryInstaller"
import {clearprogrammer, create_position_palettes, engine, trackerfromstring, item, layout, statics, tracker} from "./Layoutmaker"
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
                let prefix = "POS_ENGINE_ENGINE_"
                let engines: engine[] = []
                
                for (let i = 1; i < 3; i++){
                    let varname = prefix + i;
                    let varcontent = GetVar(UserVars(), varname);
                    if (varcontent == undefined){
                        log.info("Main(): Engine" + i + " was not found, new engine will be initialized")
                        engines.push(new engine(i))
                    } else {
                        let engine_ = new engine(i);
                        engine_.fromstring(varcontent)
                        engines.push(engine_)
                    }
                }

                log.trace("main(): Assigning groups to engines")
                if (input.result == 1) {
                    Object.keys(input.inputs).forEach((e) => {
                        if ((input.inputs[e] && e)){
                            let index = parseFloat(e.split(" ")[1]);
                            engines[index-1].engine_num = parseFloat(input.inputs[e])
                        }
                    });
                    
                    let track = trackerfromstring(GetVar(UserVars(), "POS_ENGINE_TRACKER"))
                    let statics_ = new statics()
                    if (statics_.fromstring(GetVar(UserVars(), "POS_ENGINE_STATICS")) == -1) {
                        StopProgress
                        error("No statics variable found, please reinstall the tool")
                    }
                    engines.forEach(e => {
                        e.create_engine(track, statics_)
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

        let track = new tracker(100, 100, 100, 100, 100); //TODO make start point dynamic 
        let statics_ = new statics();

        log.trace("main(): Creating appearances");
        statics_.create_appearances(track);

        log.trace("main(): Creating poalettes");
        create_position_palettes(track, statics_);

        // setting some vars
        SetVar(UserVars(), "POS_ENGINE_TRACKER", track.tostring());
        SetVar(UserVars(),"POS_ENGINE_STATICS", statics_.tostring());
        SetVar(UserVars(), "POS_ENGINE_INSTALLED", true)
        log.trace("main(): Engines prepared and ready for initialization")
    }
}

export default [main]