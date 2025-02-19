import { isInteger } from "@ma3-pro-plugins/ma3-pro-plugins-lib";
import { PLUGIN_ENV } from "./__env"

export class layout {
    items!: Array<item>;
    curr_row: Number;
    curr_col: Number;
    layout_num: Number; 

    constructor(layout_num: Number) {
        this.curr_col = 1;
        this.curr_row = 1;
        this.layout_num = layout_num;
    }

    additem(type: string, id: Number, engine: engine){
        const item_ = new item(type, id, this.curr_col, this.curr_row, engine)
        this.items.push(item_);
    }

    addrow(){
        this.curr_col =+ 1;
    }
    addcol(){
        this.curr_col =+ 1;
    }

    creategrid(){
        this.items.forEach( (item) => {
            
        });
    }
}

export class item {
    type: string;
    id: Number;
    col: Number;
    row: Number;
    width: Number;
    height: Number;
    engine: engine;


    constructor(type: string, id: Number, col: Number,  row: Number, engine: engine, width = 20, height = 20) {
        this.type = type;
        this.id = id;
        this.col = col;
        this.row = row;
        this.width = width;
        this.height = height;
        this.engine = engine;
    }
}

export class engine {
    engine_num: number; //Engine number
    positions: Array<number> = []; //Positions for physical adjustment
    positions2: Array<number> = []; //Positions for step 2 of template presets
    palette_pos: Array<number> = []; //Palettes for step 1 and 2 (respectively) of the phaser effects
    matricks: Array<number> = [-1, -1, -1] // MAtricks for position, flyouts, movements respectively 
    phasers: Array<number> = []; //Phaser effects in All1 DataPool 
    group_linear!: number; //Linear group
    group_grid!: number; //Grid group
    installed: boolean = false; //boolean that will check whether the engine is installed in MA3

    constructor(engine_num: number){
        this.engine_num = engine_num
    }

    tostring() {
        let result = [];
        result.push(this.engine_num); //index 0
        result.push("|");
        this.positions.forEach((e) => result.push(e+",")) //index 1
        result.push("|");
        this.positions2.forEach((e) => result.push(e+",")) //index 2
        result.push("|");
        this.palette_pos.forEach((e) => result.push(e+",")) // index 3
        result.push("|");
        this.matricks.forEach((e) => result.push(e+",")) // index 4
        result.push("|");
        this.phasers.forEach((e) => result.push(e+",")) // index 5
        result.push("|");
        result.push(this.group_linear) // index 6
        result.push("|");
        result.push(this.group_grid) // index 7
        result.push("|");
        result.push(this.installed) // index 8
        return result.join("")
    }
    fromstring(input: string) {
        if (input == undefined) {
            return -1
        }
        let input_split = input.split("|");
        let engine_ = new engine(parseFloat(input_split[0]));
        engine_.positions = input_split[1].split(",").map(function(item){
            return parseFloat(item)
        })
        engine_.positions2 = input_split[2].split(",").map(function(item){
            return parseFloat(item)
        })
        engine_.palette_pos = input_split[3].split(",").map(function(item){
            return parseFloat(item)
        })
        engine_.matricks = input_split[4].split(",").map(function(item){
            return parseFloat(item)
        })
        engine_.phasers = input_split[5].split(",").map(function(item){
            return parseFloat(item)
        })

        engine_.group_linear = parseFloat(input_split[6])
        engine_.group_grid = parseFloat(input_split[7])
        engine_.installed = Boolean(input_split[8])

    }

    add_groups(linear: number, grid: number) {
        this.group_linear = linear;
        this.group_grid = grid;
    }

    create_engine(track: tracker, static_: statics, phasers: Array<phaser>){
        for (let i = 0; i<2; i++){ // create custom palettes for flyout 
            clearprogrammer();
            Cmd("SelectFixtures group "+this.group_grid);
            Cmd("attribute pan + tilt at 0")
            Cmd("Store preset 2."+track.curr_pos+" /nc");
            Cmd("Label preset 2."+track.curr_pos+" POS_ENGINE_"+this.engine_num+"_PALETTE_"+(i+1)+" /nc");
            this.palette_pos.push(track.curr_pos);
            track.increment_pos();
        }

        phasers.forEach((e) => {
            let input = {
                group_no: this.group_grid,
                engine_no: this.engine_num,
                palette_1: this.palette_pos[0],
                palette_2: this.palette_pos[1],
                store_no: track.curr_all1
            }
            if(e.create_phaser(input)){
                this.phasers.push(track.curr_all1);
                track.increment_all1()
            }
            
        })
        for (let i = 0; i<this.matricks.length; i++){ // create matricks 
            let curr_matrick = track.curr_matricks
            remove("matricks", curr_matrick)
            Cmd("Store matricks "+curr_matrick+" /nc")
            Cmd("Label matricks "+curr_matrick+" POS_ENGINE_MATRICKS_E" + tostring(this.engine_num))
            this.matricks[i] = curr_matrick
            track.increment_matricks();
        }

        let i = 0; //Increment parameter for appearances
        for (let pos_no = static_.positions[0]; pos_no < static_.positions[1]; pos_no++){ //Create positions 
            remove("sequence", track.curr_sequence);
            Cmd("Store sequence "+track.curr_sequence+" /nc")
            Cmd("Assign preset 2." + pos_no + " at sequence " + track.curr_sequence + " cue 1 part 0.1")
            Cmd("Assign group "+this.group_linear+ " at sequence " + track.curr_sequence + " cue 1 part 0.1")
            Cmd("Assign appearance "+ static_.position_types[i]+"I"+" at sequence " + track.curr_sequence)
            i = i+1
            Cmd("Assign matricks "+this.matricks[0]+ " at sequence " + track.curr_sequence + " cue 1 part 0.1")

            this.positions.push(track.curr_sequence)
            track.increment_sequence();
        }
        this.positions.forEach((pos_no, i) => {//creating toggle appearances 
            const pos_preset = static_.positions[0]+i //position beloging to sequence
            DataPool()[6][pos_no-1][2][0]!.command = "copy preset 2."+pos_preset+ " at preset 2."+this.palette_pos[0] + "/nc ; " + create_toggle_command(pos_no, this.positions);
        })

        i = 0; //Increment parameter for appearances
        for (let pos_no = static_.positions[0]; pos_no < static_.positions[1]; pos_no++){ //Create positions 2 for second palette
            remove("sequence", track.curr_sequence);
            Cmd("Store sequence "+track.curr_sequence+" /nc")
            Cmd("Assign group "+this.group_linear+ " at sequence " + track.curr_sequence + " cue 1 part 0.1")
            Cmd("Assign appearance "+ static_.position_types[i]+"I"+" at sequence " + track.curr_sequence)
            i = i+1
            Cmd("Assign matricks "+this.matricks[0]+ " at sequence " + track.curr_sequence + " cue 1 part 0.1")
            this.positions2.push(track.curr_sequence)
            track.increment_sequence();
        }
        this.positions2.forEach((pos_no, i) => {//creating toggle appearances 
            const pos_preset = static_.positions[0]+i //position beloging to sequence
            DataPool()[6][pos_no-1][2][0]!.command = "copy preset 2."+pos_preset+ " at preset 2."+this.palette_pos[1] + "/nc ; " + create_toggle_command(pos_no, this.positions2);
        })

        //TODO: start with flyout/movement mechanism (one executor/sequence for all flyouts and movements)


        this.installed = true;
    }

}

declare interface phaser_creation {
    group_no: number;
    engine_no: number; //Number of the engine 
    palette_1: number;
    palette_2: number;
    store_no: number; //Must be the relative adress of the All1 datapool 
}

export class phaser {
    phaser_no?: number; 
    effect: string = "flyout";
    props: {[key: string]: number} = {
        step1_width_pt: 160,
        step2_width_pt: 160,
        step1_transistion_pt: 20,
        step2_transistion_pt: 20,
        step1_width_d: 160,
        step2_width_d: 160,
        step1_transistion_d: 20,
        step2_transistion_d: 20,
    }
    constructor(phaser_no?: number) {
        this.phaser_no = phaser_no;
    }

    create_phaser(inputs: phaser_creation): boolean{
        switch (this.effect) {
            case("flyout"): {
                clearprogrammer()
                Cmd("SelectFixtures group "+ inputs.group_no)
                Cmd("attribute dimmer at 0")
                Cmd("Integrate preset 2."+inputs.palette_1)
                Cmd("Next Step")
                Cmd("attribute dimmer at 100")
                Cmd("Integrate preset 2."+inputs.palette_2)
                Cmd("step 1")
                Cmd("attribute pan + tilt at transition "+this.props.step1_transistion_pt)
                Cmd("attribute pan + tilt at width percent "+this.props.step1_width_pt)
                Cmd("attribute dimmer at transition "+this.props.step1_transistion_d)
                Cmd("attribute dimmer at width percent "+this.props.step1_width_d)
                Cmd("step 2")
                Cmd("attribute pan + tilt at transition "+this.props.step2_transistion_pt)
                Cmd("attribute pan + tilt at width percent "+this.props.step2_width_pt)
                Cmd("attribute dimmer at transition "+this.props.step2_transistion_d)
                Cmd("attribute dimmer at width percent "+this.props.step2_width_d)
                clearprogrammer()
                break
            }
            case("updown"): {
                clearprogrammer()
                Cmd("SelectFixtures group "+ inputs.group_no)
                Cmd("Integrate preset 2."+inputs.palette_1)
                Cmd("Next Step")
                Cmd("Integrate preset 2."+inputs.palette_2)
                Cmd("Store preset 21."+inputs.store_no+" /o /nc")
                clearprogrammer()
                break
            }
        }
        return true
    }

    fromstring(input: string) {
        let result = input.split("|")
        let proplist = result[0].split(',')
        Object.values(this.props).map(function(e, i) {
            return e = parseFloat(proplist[i])
        })
        this.effect = result[1]
    }
    tostring(): string {
        let result: string[] = []
        Object.values(this.props).forEach((e) => {
            result.push(tostring(e))
            result.push(",")
        })
        result.pop()
        result.push("|"+this.effect)
        return result.join()
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
    sequences: {[key: string]: number} = {
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
            Cmd("Assign image 3."+i+" at appearance "+ track.curr_appearance);
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
function remove(type: string, no: number){//Remove an item in the DataPool
    Cmd("Delete "+ type + " " + no + " /nc");
}
function get_new_cue(sequence_no: number): number{//Creates a new cue in a sequence and returns its index
//TODO: finish get new cue function
}

//Initialisation functions
export function create_position_palettes(track: tracker, statics_: statics){
    statics_.set_position_start(track.curr_pos)
    Object.values(statics_.position_types).forEach(p => {

        Cmd("Store preset 2."+track.curr_pos+" /nc");
        Cmd("Label preset 2."+track.curr_pos+" "+ p +" /nc");
        track.increment_pos();
    }); 
    statics_.set_position_end(track.curr_pos)
}

export function create_general_sequences(track: tracker, statics_: statics){
    remove("sequence", track.curr_sequence)
    Cmd("Store sequence "+track.curr_sequence+" label POS_ENGINE_FLYOUT /nc")
    statics_.sequences["flyout"] = track.curr_sequence
    track.increment_sequence()
    remove("sequence", track.curr_sequence)
    Cmd("Store sequence "+track.curr_sequence+" label POS_ENGINE_MOVEMENT /nc")
    statics_.sequences["movement"] = track.curr_sequence
    track.increment_sequence()
}


//GET functions
export function parse_engines(){ // will find engines in variable list and return array with all engines

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

//Other functions 
function create_toggle_command(current_no: number, input_list: number[]){//Creates command for switch plugin
    let command = []
    input_list.forEach((e) =>{ //Creating command where active item is on the last
        if (e != current_no){
            command.push(e)
        }
    })
    command.push(current_no)
    return "call plugin 1 switch_" + command.join("|")

}