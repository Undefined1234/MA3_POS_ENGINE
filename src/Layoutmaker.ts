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
    engine_num: Number;
    positions!: Array<Number>;
    matricks_num!: Number;
    phasers!: Array<phaser>;

    constructor(engine_num: Number){
        this.engine_num = engine_num
    }


}

export class phaser {
    
}

export class tracker {
    curr_sequence: Number;
    curr_macro: Number;

    constructor(start_sequence: Number, start_macro: Number){
        this.curr_sequence = start_sequence;
        this.curr_macro = start_macro;
    }

    increment_sequence(){
        this.curr_sequence =+ 1;
    }
    inrement_macro(){
        this.curr_macro =+ 1;
    }

}