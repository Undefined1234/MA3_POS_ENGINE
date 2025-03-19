import { Logger, LogLevel} from "@ma3-pro-plugins/ma3-pro-plugins-lib"
import { ImageLibraryInstaller } from "./ImageLibraryInstaller"
import {create_layout, clearprogrammer, create_position_palettes, engine, trackerfromstring, item, layout, statics, tracker, create_general_sequences, parse_phasers, phaser, create_general_macros, remove_plugin, effect, onInstall} from "./Layoutmaker"
import { command } from "ftp"
import * as json from "@flying-dice/tslua-rxi-json";

let engines: Array<engine> = [];

function main(this: void, displayHandle: Display, argument: string) {

    const log = Logger({ prefix: ["PluginTemplate"], logLevel: LogLevel.TRACE })
    log.trace("main(): Plugin started")

    if (GetVar(UserVars(), "POS_ENGINE_INSTALLED")){
        let parsed: string;
        if (argument != null){
            parsed = argument.split("_")[0];
        }else {
            parsed = "dialog"
        }
        log.trace(parsed)
        switch (parsed) {
            case "uninstall": {
                ImageLibraryInstaller(log).onUninstall()
                break
            }
            case "startshow": { // objects should be loaded here
                break
            }
            case "switch": {
                let input = argument.split("_")[1]
                let list = input.split("|").map(function(e){return parseFloat(e)});
                const active = list.pop()
                log.trace("switch(): Active sequence " + tostring(active))
                if (active == undefined){
                    error("Switch():No proper format given to switch")
                    break
                    return
                }
                let active_appearance = DataPool()[6][active-1]?.appearance.name
                active_appearance = (active_appearance == undefined)? "":active_appearance
                Cmd("Assign appearance "+[active_appearance.slice(0,-1), "A"].join("")+" at sequence "+active)
                list.forEach((e) => {
                    Cmd("Assign appearance "+[DataPool()[6][e-1].appearance.name.slice(0,-1), "I"].join("")+" at sequence "+e)
                })
                break
            }
            case "dialog": {      
                let options = {
                    title: "Setup",
                    display: 1,
                    commands: [
                        {value: 0, name: "Cancel"},
                        {value: 1, name: "Update"},
                        {value: 2, name: "Phasers"},
                        {value: 3, name: "Uninstall"},
                        {value: 4, name: "Create Layout"}
                    ],
                    inputs: [
                        {name: "Group 1 Linear", value: "1", vkPlugin:'NumericInput' as 'NumericInput', whiteFilter:"1234567890"},
                        {name: "Group 1 Grid", value: "2", vkPlugin:'NumericInput' as 'NumericInput', whiteFilter:"1234567890"},
                        {name: "Group 2 Linear", value:"3", vkPlugin:'NumericInput' as 'NumericInput', whiteFilter:"1234567890"},
                        {name: "Group 2 Grid", value:"4", vkPlugin:'NumericInput' as 'NumericInput', whiteFilter:"1234567890"}
                    ],
                    
                }
                let input = MessageBox(options)
                
                log.trace("main(): Creating empty engines")
                let prefix = "POS_ENGINE_ENGINE_"
                let engines: engine[] = []
                
                let i = 1;
                while(GetVar(UserVars(), prefix+i) != undefined){
                    let engine_ = new engine(i);
                    engine_.fromstring(GetVar(UserVars(), prefix+i))
                    engines.push(engine_)
                    i = i+1
                }

                log.trace("main(): Assigning groups to engines")
                switch (input.result){
                    case (1): {
                            // Object.keys(input.inputs).forEach((e) => {
                            //     if ((input.inputs[e] != "")){
                            //         let index = parseFloat(e.split(" ")[1]);
                            //         engines[index-1].engine_num = parseFloat(input.inputs[e])
                            //     }
                            // });

                            
                            let track = trackerfromstring(GetVar(UserVars(), "POS_ENGINE_TRACKER"))
                            let statics_ = new statics()
                            if (statics_.fromstring(GetVar(UserVars(), "POS_ENGINE_STATICS")) == -1) {
                                StopProgress
                                error("No statics variable found, please reinstall the tool")
                            }
                            log.trace("main(): Creating engines")
                            engines.forEach((e, i) => {
                                e.group_linear = parseFloat(input.inputs["Group "+(i+1)+" Linear"])
                                e.group_grid = parseFloat(input.inputs["Group "+(i+1)+" Grid"])
                                e.create_engine(track, statics_, parse_phasers())
                            })
                        break
                    }
                    case(2): {
                        let phaserlist = parse_phasers();
                        let inputs: {name:string, value:string}[] = []
                        phaserlist.forEach(e => {
                            Object.keys(e.props).forEach(ee => {
                                inputs.push({name: ee, value: tostring(e.props[ee])})
                            })
                        });
                        let options = {
                            title: "Phasers",
                            commands: [
                                {value: 0, name: "Cancel"},
                            ], 
                            display: 2,
                        }
                        phaserlist.forEach((e,i) => {
                            options.commands.push({value:i+1, name: "Phaser:"+tostring(i+1)})
                        })
                        let result2 = MessageBox(options) //Phaser edits
                        switch (result2.result){
                            case(0): {
                                StopProgress
                                return
                                break
                            }
                            default: {
                                let selectedphaser = phaserlist[result2.result - 1]
                                let effect: string = selectedphaser.effect; //type of phaser
                                let values: {[key: string]: number} = {
                                    "flyout": 0,
                                    "updown": 1
                                }
                                let selectors: MessageBoxSelectorOptions[] = [
                                    {name: "Effect type", selectedValue: values[effect], values: values},
                                ]
                                let inputs: MessageBoxInputOptions[] = [] //value inputs for phaser
                                Object.keys(selectedphaser.props).forEach(e =>{
                                    inputs.push({name:e, value: tostring(selectedphaser.props[e]), whiteFilter: "0123456789", vkPlugin: 'NumericInput', maxTextLength: 3})
                                })
                                let options = {
                                    title: "Phaser",
                                    commands: [
                                        {value: 0, name: "Cancel"},
                                        {value: 1, name: "Update"},
                                    ],
                                    selectors: selectors,
                                    inputs: inputs
                                }
                                let result3 = MessageBox(options)
                                switch (result3.result){
                                    case(0): {
                                        return
                                    }
                                    case(1): {
                                        selectedphaser.effect = (Object.keys(values).find(key => values[key] === result3.selectors['Effect type']) || "updown") as effect
                                        Object.keys(result3.inputs).forEach((e) => {
                                            selectedphaser.props[e] = parseFloat(result3.inputs[e])
                                        })
                                        SetVar(UserVars(), "POS_ENGINE_PHASER_"+selectedphaser.phaser_no, selectedphaser.tostring())
                                        return
                                    }
                                }
                                return
                                break
                            }
                        }

                    }
                    case(3): {//TODO: create full uninstall procedure 
                        remove_plugin();
                        DelVar(UserVars(), "POS_ENGINE_INSTALLED")
                        break
                    }
                    case(4): {
                        create_layout()
                        break
                    }
                }

                break  
            }
        }
    }else{

        let selectors: MessageBoxSelectorOptions[] = [
            {name: "Speed",selectedValue: 0,values: {"Speed1": 0,"Speed2": 1}},
            {name: "NO_Engines",selectedValue: 0,values: {"1": 0,"2": 1}},
        ]

        let options = {
            title: "Setup",
            display: 1,
            commands: [
                {value: 0, name: "Cancel"},
                {value: 1, name: "Install"},
            ],
            selectors: selectors,
            inputs: [
                {name: "Start_address", value:"100", vkPlugin:'NumericInput' as 'NumericInput', whiteFilter:"1234567890"}
            ]
        }
        let input = MessageBox(options)

        if (input.result == 1){
            onInstall();
            log.trace("main(): Starting installation");
            log.trace("main(): Clearing programmer");
            clearprogrammer();
            log.trace("main(): Install images");
            ImageLibraryInstaller(log).onInstall();
            log.trace("main(): prepeare objects");

            let start_adress = parseFloat(input.inputs['Start_address'])
            let track = new tracker(start_adress, start_adress, start_adress, start_adress, start_adress, start_adress);  
            let statics_ = new statics();

            log.trace("main(): Creating appearances");
            statics_.create_appearances(track);

            log.trace("main(): Creating poalettes");
            create_position_palettes(track, statics_);
            create_general_sequences(track, statics_);
            create_general_macros(track, statics_)
            // Creating standard phasers
            SetVar(UserVars(), "POS_ENGINE_PHASER_1", new phaser(1,"phaser1").tostring())
            SetVar(UserVars(), "POS_ENGINE_PHASER_2", new phaser(2, "phaser2", "updown").tostring())
            // Creating Engines
            let i_max = input.selectors['NO_Engines']
            for (let i=0; i<i_max+1; i++){
                log.trace("Main(): Creating engine")
                SetVar(UserVars(), "POS_ENGINE_ENGINE_"+tostring((i+1)), new engine(i+1).tostring())
            }
            // Setting some vars
            SetVar(UserVars(), "POS_ENGINE_TRACKER", track.tostring());
            SetVar(UserVars(),"POS_ENGINE_STATICS", statics_.tostring());
            SetVar(UserVars(), "POS_ENGINE_INSTALLED", true)
            log.trace("main(): Engines prepared and ready for initialization")
        }
    }
}

export default [main]