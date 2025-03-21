import { isInteger } from "@ma3-pro-plugins/ma3-pro-plugins-lib";
import { PLUGIN_ENV } from "./__env"
import * as json from "@flying-dice/tslua-rxi-json";

export class layout {
    items: Array<item> = [];
    curr_row: number;
    curr_col: number;
    layout_num: number; 

    constructor(layout_num: number) {
        this.curr_col = 0;
        this.curr_row = 0;
        this.layout_num = layout_num;
    }

    additem(item: item){
        this.items.push(item);
    }

    addrow(){
        this.curr_col = 0;
        this.curr_row = this.curr_row - this.items.slice(-1)[0].width;
    }
    addrow_align(){
        let lowest_pos = 0
        this.items.forEach(e => {
            if (e.row < lowest_pos){
                lowest_pos = e.row
            }
        })
        this.curr_row = lowest_pos
    }
    addcol(){
        this.curr_col = this.curr_col + this.items.slice(-1)[0].height;
    }

    /**
     * parse_engines
     * Needs an array containing all phasers. The engine will store each item for each phaser and assign a specific coordinate to each item that needs 
     * to be shown in the layout view. 
     * 
     * @var {input} is an array containing engines
     */
    parse_engines(input: Array<engine>){
        input.forEach((e) => {
            this.additem(new item(undefined, 1, this.curr_col, this.curr_row,false,80,80, "POS_ENGINE"))
            this.addcol()
            e.params.positions.forEach((pos) => {
                this.additem(new item(DataPool()[6], pos, this.curr_col, this.curr_row, false))
                this.addcol()
            })
            e.params.phaser_assigns.forEach(e => {
                this.additem(new item(DataPool()[8], e, this.curr_col, this.curr_row, true))
                this.addcol()
            })
            this.addrow()
            e.params.positions2.forEach((pos) => {
                this.additem(new item(DataPool()[6], pos, this.curr_col, this.curr_row, false))
                this.addcol()
            })
            e.params.matricks.forEach((pos) => {
                this.additem(new item(DataPool()[10], pos, this.curr_col, this.curr_row, true))
                this.addcol()
            })
        })
    }

    /**
     * creategrid
     * Takes the item array and starts plotting.
     */
    creategrid(){
        DataPool()[13].Delete(this.layout_num)
        Printf("Deleted layout")
        let layout = DataPool()[13].Create(this.layout_num)
        Printf("Aantal items "+this.items.length)
        this.items.forEach( (item, index) => {
            layout.Append()
            let itemobj = layout.Children().slice(-1)[0]
            if (item.type){
                itemobj.object = item.type.Get(item.id)
            }
            if (item.text){
                itemobj.customTextText = item.text
            }
            itemobj.posY = item.row*item.width
            itemobj.posX = item.col*item.height
            itemobj.width = item.width
            itemobj.height = item.height
            itemobj.visibilityObjectName = item.objectname
        });
    }
}

export class item {
    type: Obj<DataPoolClass> | undefined;
    id: number;
    col: number;
    row: number;
    width: number;
    height: number;
    objectname: boolean;
    text: string | undefined;


    constructor(type: Obj<DataPoolClass> | undefined = undefined, id: number, col: number,  row: number, objectname = false  ,width = 40, height = 40, text: string | undefined = undefined) {
        this.type = type;
        this.id = id;
        this.col = col;
        this.row = row;
        this.width = width;
        this.height = height;
        this.objectname = objectname;
        this.text = text;
    }
}

declare type engine_params ={
    "engine_num": number,
    "positions": number[],
    "positions2": number[],
    "palette_pos": number[],
    "matricks": number[],
    "phasers": number[],
    "phaser_assigns": number[],
    "group_linear": number,
    "group_grid": number,
    "macros": {[key: string]: number},
    "installed": number
}

/**
 * Engine class
 * @var {engine_num} Engine number
 * @var {positions} Positions Array<number> containing the MA-indexed sequence numbers of each position of the engine
 * @var {positions2} Positions Array<number> containing the MA-indexed sequence numbers of the second sequences containing macros to assign palettes for the phasers 
 * @var {palette_pos} list with size of two containing the MA-indexed numbers of the palettes that are being used for the phaser effects 
 * @var {matricks} list with MA-indexed numbers for the matricks for respectively the: positions (0), phasers (1), movements (2)
 */
export class engine {

    params: engine_params = {
        "engine_num": -1, //Engine number
        "positions": [], //Positions for physical adjustment SEQUENCE
        "positions2": [], //Positions for step 2 of template presets SEQUENCE
        "palette_pos": [], //Palettes for step 1 and 2 (respectively) of the phaser effects
        "matricks":  [-1, -1, -1], // MAtricks for position, flyouts, movements respectively MATRICKS
        "phasers":  [], //Phaser effects in All1 DataPool 
        "phaser_assigns":  [], //macros that assign phasers to sequence MACROS
        "group_linear": -1, //Linear group
        "group_grid": -1, //Grid group
        "macros": {//TODO add to string parser and getter
            "set_grid": -1, //set sequence recipe group to grid
            "set_linear": -1, //set sequence recipe group to linear
            "set_circle": -1, //set movement sequence cue X part value to circle
            "set_pan": -1, //set movement sequence cue X part value to pan
            "set_tilt": -1, //set movement sequence cue X part value to tilt
        },
        "installed": 0 //boolean that will check whether the engine is installed in MA3
    }



    constructor(engine_num: number){
        this.params.engine_num = engine_num
    }
    /**
     * Tostring function converts all parameters in this class into a storable string
     * @returns string
     */
    tostring() {
        return json.encode(this.params)
    }
    fromstring(input: string | undefined) {
        if (input){
            this.params = json.decode(input)
        }
    }

    add_groups(linear: number, grid: number) {
        this.params.group_linear = linear;
        this.params.group_grid = grid;
    }

    create_engine(track: tracker, static_: statics, phasers: Array<phaser>){
        for (let i = 0; i<2; i++){ // create custom palettes for flyout 
            clearprogrammer();
            Cmd("SelectFixtures group "+this.params.group_grid);
            Cmd("attribute pan + tilt at 0")
            Cmd("Store preset 2."+track.curr_pos+" /nc");
            Cmd("Label preset 2."+track.curr_pos+" POS_ENGINE_"+this.params.engine_num+"_PALETTE_"+(i+1)+" /nc");
            if (!this.params.installed){
                this.params.palette_pos.push(track.curr_pos);
            }else {this.params.palette_pos[i] = track.curr_pos}
            
            track.increment_pos();
        }

        phasers.forEach((e, i) => { //create phasers for engine
            let input = {
                group_no: this.params.group_grid,
                engine_no: this.params.engine_num,
                palette_1: this.params.palette_pos[0],
                palette_2: this.params.palette_pos[1],
                store_no: track.curr_all1
            }
            if(e.create_phaser(input)){
                if (!this.params.installed){
                    this.params.phasers.push(track.curr_all1);
                }else {this.params.phasers[i] = track.curr_all1}
                track.increment_all1()
            }
            
        })
        for (let i = 0; i<this.params.matricks.length; i++){ // create matricks 
            let curr_matrick = track.curr_matricks
            Delete("matricks", curr_matrick)
            Cmd("Store matricks "+curr_matrick+" /nc")
            Cmd("Label matricks "+curr_matrick+" POS_ENGINE_MATRICKS_E" + tostring(this.params.engine_num))
            this.params.matricks[i] = curr_matrick
            track.increment_matricks();
        }

        let i = 0; //Increment parameter for appearances
        for (let pos_no = static_.positions[0]; pos_no < static_.positions[1]; pos_no++){ //Create positions 
            Delete("sequence", track.curr_sequence);
            Cmd("Store sequence "+track.curr_sequence+" /nc")
            Cmd("Assign preset 2." + pos_no + " at sequence " + track.curr_sequence + " cue 1 part 0.1")
            Cmd("Assign group "+this.params.group_linear+ " at sequence " + track.curr_sequence + " cue 1 part 0.1")
            Cmd("Assign appearance "+ static_.position_types[i]+"I"+" at sequence " + track.curr_sequence)
            DataPool()[6][track.curr_sequence-1].offWhenOverridden = false;
            DataPool()[6][track.curr_sequence-1][2][0].Children()[0].matricks = DataPool()[10][this.params.matricks[0]-1]
            
            Cmd("Assign matricks "+this.params.matricks[0]+ " at sequence " + track.curr_sequence + " cue 1 part 0.1")

            if (!this.params.installed){
                this.params.positions.push(track.curr_sequence)
            }else{this.params.positions[i] = track.curr_sequence}
            i = i+1
            track.increment_sequence();
        }
        this.params.positions.forEach((pos_no, i) => {//creating toggle appearances 
            const pos_preset = static_.positions[0]+i //position beloging to sequence
            DataPool()[6][pos_no-1][2][0]!.command = "copy preset 2."+pos_preset+ " at preset 2."+this.params.palette_pos[0] + "/nc ; " + create_toggle_command(pos_no, this.params.positions, "sequence");
        })

        i = 0; //Increment parameter for appearances
        for (let pos_no = static_.positions[0]; pos_no < static_.positions[1]; pos_no++){ //Create positions 2 for second palette
            Delete("sequence", track.curr_sequence);
            Cmd("Store sequence "+track.curr_sequence+" /nc")
            Cmd("Assign group "+this.params.group_linear+ " at sequence " + track.curr_sequence + " cue 1 part 0.1")
            Cmd("Assign appearance "+ static_.position_types[i]+"I"+" at sequence " + track.curr_sequence)
            
            Cmd("Assign matricks "+this.params.matricks[0]+ " at sequence " + track.curr_sequence + " cue 1 part 0.1")

            if (!this.params.installed){
                this.params.positions2.push(track.curr_sequence)
            }else {this.params.positions2[i] = track.curr_sequence}
            i = i+1
            track.increment_sequence();
        }
        this.params.positions2.forEach((pos_no, i) => {//creating toggle appearances 
            const pos_preset = static_.positions[0]+i //position beloging to sequence
            DataPool()[6][pos_no-1][2][0]!.command = "copy preset 2."+pos_preset+ " at preset 2."+this.params.palette_pos[1] + "/nc ; " + create_toggle_command(pos_no, this.params.positions2, "sequence");
        })

        //TODO: start with flyout/movement mechanism (one executor/sequence for all flyouts and movements)
        while (DataPool()[6][static_.sequences["flyout"]-1][2][0].Children().length<this.params.engine_num){
            DataPool()[6][static_.sequences["flyout"]-1][2][0].Aquire()
        }

        DataPool()[6][static_.sequences["flyout"]-1][2][0].Children()[this.params.engine_num-1].selection = DataPool()[5].Get(this.params.group_grid)
        this.params.phasers.forEach((e, i) => { //Creating macros for position dependend phaser effects 
            DataPool()[8].Delete(track.curr_macro)
            let macro = DataPool()[8].Create(track.curr_macro)
            let preset = DataPool()[4][21].Get(e)
            macro.name = "POS_ENGINE_"+this.params.engine_num+"_SET_"+phasers[i].params["phaser_name"]
            macro.CommandStore()
            macro.Children()[0].command = "Assign preset 21."+preset.index+" at sequence "+static_.sequences["flyout"]+" cue 1 part 0."+this.params.engine_num
            if (!this.params.installed){
                this.params.phaser_assigns.push(track.curr_macro)
            }else{this.params.phaser_assigns[i] = track.curr_macro}
            
            track.inrement_macro()
        })

        this.params.installed = 1;
        SetVar(UserVars(), "POS_ENGINE_ENGINE_"+this.params.engine_num, this.tostring())
    }

}

declare interface phaser_creation {
    group_no: number;
    engine_no: number; //Number of the engine 
    palette_1: number;
    palette_2: number;
    store_no: number; //Must be the relative adress of the All1 datapool 
}

export type effect = |"flyout"|"updown"|"flyoutsoft"

declare type phaser_params = {
    "phaser_name": string | undefined,
    "phaser_no": number,
    "effect": effect,
    "props": {[key: string]: number}
}

export class phaser {
    params: phaser_params = {
        "phaser_name": "",
        "phaser_no": 0,
        "effect": "" as effect,
        "props": {
            "step1_width_pt": 30,
            "step2_width_pt": 100,
            "step1_transistion_pt": 100,
            "step2_transistion_pt": 100,
            "step1_width_d": 30,
            "step2_width_d": 100,
            "step1_transistion_d": 0,
            "step2_transistion_d": 100,
        }


    }

    constructor(phaser_no?: number, name?:string, effect?:effect) {
        this.params["phaser_no"] = phaser_no || -1;
        this.params["phaser_name"] = name;
        this.params["effect"] = effect || "flyout" as effect;
    }

    create_phaser(inputs: phaser_creation): boolean{
        switch (this.params["effect"]) {
            case("flyout"): {
                clearprogrammer()
                Cmd("SelectFixtures group "+ inputs.group_no)
                Cmd("attribute dimmer at 0")
                Cmd("Integrate preset 2."+inputs.palette_1)
                Cmd("Next Step")
                Cmd("attribute dimmer at 100")
                Cmd("Integrate preset 2."+inputs.palette_2)
                Cmd("step 1")
                Cmd("attribute pan + tilt at transition percent "+this.params["props"]["step1_transistion_pt"])
                Cmd("attribute pan + tilt at width percent "+this.params["props"].step1_width_pt)
                Cmd("attribute dimmer at transition percent "+this.params["props"].step1_transistion_d)
                Cmd("attribute dimmer at width percent "+this.params["props"].step1_width_d)
                Cmd("step 2")
                Cmd("attribute pan + tilt at transition percent "+this.params["props"].step2_transistion_pt)
                Cmd("attribute pan + tilt at width percent "+this.params["props"].step2_width_pt)
                Cmd("attribute dimmer at transition percent "+this.params["props"].step2_transistion_d)
                Cmd("attribute dimmer at width percent "+this.params["props"].step2_width_d)
                Cmd("Store preset 21."+inputs.store_no+" /o /nc")
                clearprogrammer()
                break
            }
            case("flyoutsoft"):{
                clearprogrammer()
                break
            }
            case("updown"): {
                clearprogrammer()
                Cmd("SelectFixtures group "+ inputs.group_no)
                Cmd("Integrate preset 2."+inputs.palette_1)
                Cmd("Next Step")
                Cmd("Integrate preset 2."+inputs.palette_2)
                Cmd("step 1")
                Cmd("attribute pan + tilt at transition percent "+this.params["props"].step1_transistion_pt)
                Cmd("attribute pan + tilt at width percent "+this.params["props"].step1_width_pt)
                Cmd("step 2")
                Cmd("attribute pan + tilt at transition percent "+this.params["props"].step2_transistion_pt)
                Cmd("attribute pan + tilt at width percent "+this.params["props"].step2_width_pt)
                Cmd("Store preset 21."+inputs.store_no+" /o /nc")
                clearprogrammer()
                break
            }
        }
        return true
    }

    fromstring(input: string) {
        this.params = json.decode(input)
    }
    tostring(): string {
        return json.encode(this.params)
    }
}

export class tracker { 
    start_image = 100; 
    curr_sequence: number;
    curr_macro: number;
    curr_pos: number;
    curr_appearance: number;
    curr_matricks: number; 
    curr_all1: number;

    constructor(start_sequence: number, start_macro: number, curr_pos: number, start_appearance: number, matricks: number, all1: number){
        this.curr_sequence = start_sequence;
        this.curr_macro = start_macro;
        this.curr_pos = curr_pos;
        this.curr_appearance = start_appearance;
        this.curr_matricks = matricks; 
        this.curr_all1 = all1;
    };

    increment_sequence(){
        this.curr_sequence = this.curr_sequence + 1;
    };
    inrement_macro(){
        this.curr_macro = this.curr_macro + 1;
    };
    increment_pos(){
        this.curr_pos = this.curr_pos + 1;
    };
    increment_appearance(){
        this.curr_appearance = this.curr_appearance + 1;
    }
    increment_matricks(){
        this.curr_matricks = this.curr_matricks + 1; 
    }
    increment_all1(){
        this.curr_all1 = this.curr_all1 + 1;
    }
    increment_macro(){
        this.curr_macro = this.curr_macro + 1;
    }


    tostring(){
        return [this.curr_sequence, this.curr_macro, this.curr_pos].join(",") 
    }
    fromstring() {

    }
}

export function trackerfromstring(string: string | undefined){
    if (!string){
        error("main(): Tracker object was not found, please reinstall plugin")
        StopProgress
    }
    let s = string.split(",")
    let curr_sequence = parseFloat(s[0]);
    let curr_macro = parseFloat(s[1]);
    let curr_pos = parseFloat(s[2]);
    return new tracker(curr_sequence, curr_macro, curr_pos, 100, 100,100);
}

export class statics { // Class containing static content for this plugin //TODO: add remote control for OnStartup sequence 
    positions: number[] = [-1,-1]; //Begin and end number of positions in position palette 
    sequences: {[key: string]: number} = { //MA3 ID of sequence containing flyout and movement control
        "flyout": -1,
        "movement": -1,
    };
    
    appearances: {[key: string]: number|undefined} = {}; // key = position + on off indicator, value = position on appearances palette 
    position_types: {[key: number]: string} = {
        0: "LOWFRONT",
        1: "LOWPOINT",
        2: "LOWSPREAD",
        3: "MIDFRONT",
        4: "MIDPOINT",
        5: "MIDSPREAD",
        6: "UPFRONT",
        7: "UPPOINT",
        8: "UPSPREAD",
        9: "POS1",
        10: "POS2",
        11: "POS3"
    }
    group_types = {
        0: "POS_LINEAR",
        1: "POS_GRID"
    }
    set_position_start(n: number){
        this.positions[0] = n;
    }
    set_position_end(n: number){
        this.positions[1] = n;
    }
    append_appearance(key: string, value: number){
        this.appearances[key] = value;
    }

    tostring(){
        let result = [];
        this.positions.forEach((e) => {
            result.push(e+",")
        })
        result.push("|")
        Object.keys(this.sequences).forEach((e) => {
            result.push(e+":"+this.sequences[e])
            result.push(",")
        })
        result.pop()
        result.push("|")
        Object.keys(this.appearances).forEach((e) => {
            let v = this.appearances[e]
            result.push(e+":"+v+",")
        })

        return result.join("")
    }
    fromstring(input: string | undefined) {
        if (input == undefined) {
            return -1;
        }
        let input_split = input.split("|")
        let positions: number[] = [];
        let sequences: {[key: string]: number} = {};
        let appearances: {[key: string]: number|undefined} = {}

        input_split[0].split(",").forEach((e) => positions.push(parseFloat(e)))
        input_split[1].split(",").forEach((e) => {
            let i = e.split(":"); 
            sequences[i[0]] = parseFloat(i[1])
        })
        input_split[2].split(",").forEach((v) => {
            let v_split = v.split(":");
            appearances[v_split[0]] = tonumber(v_split[1]);
        })
        this.appearances = appearances;
        this.sequences = sequences;
        this.positions = positions;
    }

    create_appearances(track: tracker){ //will create appearances and add them to statics class
        let i = track.start_image; 
        for (let j = 0; j<2*Object.keys(this.position_types).length+Object.keys(this.group_types).length; j++) {
            Cmd("Assign image 3."+i+" at appearance "+ track.curr_appearance+" /nc /o");
            let name = ShowData().Appearances[track.curr_appearance - 1].name; 
            let name_list = name.split("_");
            ShowData().Appearances[track.curr_appearance - 1].name = name_list.slice(-2)[0]
            this.append_appearance(name_list.slice(-2)[0], track.curr_appearance)
            track.increment_appearance();
            i = i + 1;
        }
    }
}

//MA3 functions
export function clearprogrammer() { //TODO: extend clearprogrammer to really be clear 
    Cmd("clear; clear; clear")
}
function Delete(type: string, no: number){//Delete an item in the DataPool
    Cmd("Delete "+ type + " " + no + " /nc");
}
function new_cue_by_index(sequence_no: number): number{//Creates a new cue at given index
//TODO: finish get new cue function
return -1
}

//Initialisation functions
export function create_position_palettes(track: tracker, statics_: statics){
    statics_.set_position_start(track.curr_pos)
    Object.values(statics_.position_types).forEach(p => {
        try {
            DataPool()[4][2].Delete(DataPool()[4][2].Get(p).index)
        } catch (error) {
            
        }
            

        Cmd("Store preset 2."+track.curr_pos+" /nc");
        Cmd("Label preset 2."+track.curr_pos+" "+ p +" /nc");
        track.increment_pos();
    }); 
    statics_.set_position_end(track.curr_pos)
}

export function create_general_sequences(track: tracker, statics_: statics){
    DataPool()[6].Delete(track.curr_sequence)
    DataPool()[6].Create(track.curr_sequence).Aquire().no = 1
    DataPool()[6][track.curr_sequence-1].name = "POS_ENGINE_FLYOUT"
    statics_.sequences["flyout"] = track.curr_sequence
    track.increment_sequence()
    DataPool()[6].Delete(track.curr_sequence)
    DataPool()[6].Create(track.curr_sequence).Aquire().no = 1
    DataPool()[6][track.curr_sequence-1].name = "POS_ENGINE_MOVEMENT"
    statics_.sequences["movement"] = track.curr_sequence
    track.increment_sequence()
}

export function create_general_macros(track: tracker, statics_: statics){
    Object.keys(statics_.sequences).forEach(e =>{
        DataPool()[8].Delete(track.curr_macro)
        let macro = DataPool()[8].Create(track.curr_macro)
        macro.CommandStore()
        macro.Children()[0].command = "Set sequence "+statics_.sequences[e]+" property 'Speedmaster' 'BPM'"
        macro.CommandStore()
        macro.Children()[1].command = "Set sequence "+statics_.sequences[e]+" property 'Ratemaster' 'BPM'"
        macro.name = "POS_ENGINE_"+e+"_BPM"
        track.increment_macro();
        DataPool()[8].Delete(track.curr_macro)
        macro = DataPool()[8].Create(track.curr_macro)
        macro.CommandStore()
        macro.Children()[0].command = "Set sequence "+statics_.sequences[e]+" property 'Speedmaster' 'Speed1'"
        macro.name = "POS_ENGINE_"+e+"_SPEED"
        macro.CommandStore()
        macro.Children()[1].command = "Set sequence "+statics_.sequences[e]+" property 'Ratemaster' 'Speed1'"
        track.increment_macro();
    })
}


//GET functions
export function parse_engines(): Array<engine>{ // will find engines in variable list and return array with all engines
    let found : Array<engine> = [];
    let i = 1
    let condition = true
    while (condition){
        let input = GetVar(UserVars(), "POS_ENGINE_ENGINE_"+i)
        if (input != undefined){
            let engine_ = new engine(1)
            engine_.fromstring(input)
            Printf(engine_.tostring())
            found.push(engine_)
            i = i+1
        }else {condition = false}
    }
    if (found.length == 0) {
        return found
    }
    return found
}

export function parse_phasers(): Array<phaser>{// will find phaser effects that were created and return them as a list of this phaser 
    let found : Array<phaser> = [];
    let i = 1
    let condition = true
    while (condition){
        let input = GetVar(UserVars(), "POS_ENGINE_PHASER_"+i)
        if (input != undefined){
            let phaser_ = new phaser()
            phaser_.fromstring(input)
            found.push(phaser_)
            i = i+1
        }else {condition = false}
    }
    return found
}

//Layout functions
export function create_layout() {
    let engines = parse_engines()

    let layout_ = new layout(100)
    layout_.parse_engines(engines)
    layout_.creategrid()
}

//Toggle functions
function create_toggle_command(current_no: number, input_list: number[], type: string){//Creates command for switch plugin
    let command = []
    let pluginname = "\"" +PLUGIN_ENV.pluginName+" v"+PLUGIN_ENV.pluginVersion.replaceAll(".", "_") + "\""
    input_list.forEach((e) =>{ //Creating command where active item is on the last
        if (e != current_no){
            command.push(e)
        }
    })
    command.push(current_no)
    return "call plugin "+ pluginname +" switch_"+ type + "_" + command.join("|")

}

export function toggle(input_: string){
    let input = input_.split("_")[2]
    let list = input.split("|").map(function(e){return parseFloat(e)});
    const active = list.pop()
    if (active == undefined){
        error("Switch():No proper format given to switch")
        return
    }
    let active_appearance = DataPool()[6][active-1]?.appearance.name
    active_appearance = (active_appearance == undefined)? "":active_appearance
    Cmd("Assign appearance "+[active_appearance.slice(0,-1), "A"].join("")+" at sequence "+active)
    list.forEach((e) => {
        Cmd("Assign appearance "+[DataPool()[6][e-1].appearance.name.slice(0,-1), "I"].join("")+" at sequence "+e)
    })
}

//Remove functions 
export function remove_plugin(){
    let statics_ = new statics();
    statics_.fromstring(GetVar(UserVars(), "POS_ENGINE_STATICS"));
    Object.values(statics_.appearances).forEach(e => {
        if (e){
            ShowData().Appearances.Delete(e)
        }
    })    
    DelVar(UserVars(), "POS_ENGINE_STATICS")

    let pluginname = PLUGIN_ENV.pluginName+" v"+PLUGIN_ENV.pluginVersion.replaceAll(".", "_")
    let plugin = DataPool()[7].Get(pluginname)
    plugin.lock = false;
}

export function onInstall(){
    let pluginname = PLUGIN_ENV.pluginName+" v"+PLUGIN_ENV.pluginVersion.replaceAll(".", "_")
    let plugin = DataPool()[7].Get(pluginname)
    plugin.lock = true;
}