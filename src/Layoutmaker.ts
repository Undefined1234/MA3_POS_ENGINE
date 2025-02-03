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
    engine_num: number;
    positions!: Array<number>;
    palette_pos!: Array<number>;
    matricks_flyout_num!: number;
    matricks_movement_num!: number;
    matricks_pos!: number;
    phasers!: Array<phaser>;
    group_linear!: number;
    group_grid!: number;

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

    create_engine(track: tracker, preset: presets){
        for (let i = 0; i<2; i++){ // create custom palettes for flyout 
            Cmd("Store preset 2."+track.curr_pos+" /nc");
            Cmd("Store label 2."+track.curr_pos+" POS_ENGINE_"+this.engine_num+"_PALETTE_"+(i+1)+" /nc");
            this.palette_pos[i] = track.curr_pos;
            track.increment_pos;
        }
    }

}

export class phaser {
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

export class tracker {
    curr_sequence: number;
    curr_macro: number;
    curr_pos: number;

    constructor(start_sequence: number, start_macro: number, curr_pos: number){
        this.curr_sequence = start_sequence;
        this.curr_macro = start_macro;
        this.curr_pos = curr_pos;
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
    tostring(){
        return [this.curr_sequence, this.curr_macro, this.curr_pos].join(",") 
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
    return new tracker(curr_sequence, curr_macro, curr_pos);
}

export class presets { // Presets used for all engines 
    positions: Number[] = [-1,-1]; //Begin and end number 

    set_position_start(n: Number){
        this.positions[0] = n;
    }
    set_position_end(n: Number){
        this.positions[1] = n;
    }
    tostring(){
        return this.positions.join(",")
    }

}

const positions = {
    0: "LOWFRONT",
    1: "LOWPOINT",
    2: "LOWSPREAD",
    3: "MIDFRONT",
    4: "MIDPOINT",
    5: "MIDSPREAD",
    6: "UPFRONT",
    7: "UPPOINT",
    8: "UPSPREAD"
};

export function clearprogrammer() {
    Cmd("clear; clear; clear")
}

export function create_positions(track: tracker, presets: presets){
    presets.set_position_start(track.curr_pos)
    Object.values(positions).forEach(p => {
        Cmd("Store preset 2."+track.curr_pos+" /nc");
        Cmd("Label preset 2."+track.curr_pos+" "+ p +" /nc");
        track.increment_pos();
    }); 
    presets.set_position_end(track.curr_pos)
}

export function parse_engines(){ // will find engines in variable list and return array with all engines

}