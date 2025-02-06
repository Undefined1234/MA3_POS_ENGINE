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
    positions!: Array<number>; //Positions for physical adjustment
    positions2!: Array<number>; //Positions for step 2 of template presets
    palette_pos!: Array<number>; //Palettes for step 1 and 2 (respectively) of the phaser effects
    matricks!: Array<number>; // MAtricks for position, flyouts, movements respectively 
    phasers!: Array<phaser>; //Phaser effects 
    group_linear!: number; //Linear group
    group_grid!: number; //Grid group

    constructor(engine_num: number){
        this.engine_num = engine_num
    }

    tostring() {
        let dict = [];
        dict.push(this.engine_num);
        dict.push(this.positions.length)
        this.positions.forEach(e =>{
            dict.push(e)
        })

        return dict.join(",") // engine_num , length pos array , pos array, 
    }
    fromstring() {

    }

    add_groups(linear: number, grid: number) {
        this.group_linear = linear;
        this.group_grid = grid;
    }

    create_engine(track: tracker, static_: statics){
        for (let i = 0; i<2; i++){ // create custom palettes for flyout 
            Cmd("Store preset 2."+track.curr_pos+" /nc");
            Cmd("Store label 2."+track.curr_pos+" POS_ENGINE_"+this.engine_num+"_PALETTE_"+(i+1)+" /nc");
            this.palette_pos[i] = track.curr_pos;
            track.increment_pos();
        }
        for (let pos_no in static_.positions){ // Create positon sequences 
            remove("sequence", track.curr_sequence);
            Cmd("Store sequence "+track.curr_sequence+" /r")
            Cmd("Assign preset 2." + pos_no + " at sequence " + track.curr_sequence + " cue 1 part 0.*")

            this.positions.push(track.curr_appearance)
            track.increment_sequence();
        }
    }

}

export class phaser { //TODO: Make phasers more general 
    cross: String;
    step1_width: Number;
    step2_width: Number;
    step1_size: Number;
    step2_size: Number;
    step1_palette!: Number;
    step2_palette!: Number;

    constructor(cross: String, step1_width: Number, step2_width: Number, step1_size: Number, step2_size:Number) {
        this.cross = cross;
        this.step1_size = step1_size;
        this.step2_size = step2_size;
        this.step1_width = step1_width;
        this.step2_width = step2_width;
    }

    create_phaser(){

    }
}

export class tracker { //TODO: add tracker for: all1, matricks. And create function that loops through start point and finds first available free spot. 
    start_image = 100; 
    curr_sequence: number;
    curr_macro: number;
    curr_pos: number;
    curr_appearance: number;

    constructor(start_sequence: number, start_macro: number, curr_pos: number, start_appearance: number){
        this.curr_sequence = start_sequence;
        this.curr_macro = start_macro;
        this.curr_pos = curr_pos;
        this.curr_appearance = start_appearance;
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
    return new tracker(curr_sequence, curr_macro, curr_pos, 100);
}

export class statics { // Class containing static content for this plugin //TODO: add remote control for OnStartup sequence 
    positions: number[] = [-1,-1]; //Begin and end number of positions in position palette 
    appearances: {[key: string]: number} = {}; // key = position + on off indicator, value = position on appearances palette 
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
        return this.positions.join(",")
    }
    fromstring() {

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

export function clearprogrammer() { //TODO: extend clearprogrammer to really be clear 
    Cmd("clear; clear; clear")
}

export function create_position_palettes(track: tracker, statics_: statics){
    statics_.set_position_start(track.curr_pos)
    Object.values(statics_.position_types).forEach(p => {
        Cmd("Store preset 2."+track.curr_pos+" /nc");
        Cmd("Label preset 2."+track.curr_pos+" "+ p +" /nc");
        track.increment_pos();
    }); 
    statics_.set_position_end(track.curr_pos)
}

export function parse_engines(){ // will find engines in variable list and return array with all engines

}

function remove(type: string, no: number){
    Cmd("Delete "+ type + " " + no + " /nc");
}