const COLORS = {
    1: '#00fbff',
    2: '#0800ff',
    3: '#ffaa00',
    4: '#ffee00',
    5: '#ff000d',
    6: '#ff000d',
    7: '#b700ff',
}

class Piece {
    gd = null;
    
    hit_ground = null

    id = null;
    shape = null;
    last_move = null;

    swapped = false;

    constructor(gd, x, y) {
        this.gd = gd;
        this.x = x || Math.floor(this.gd.grid_width / 2) - 2;
        this.y = y || -1;
        this.y_f = this.y;
    }

    tick() {
        if (this._check_collision(0, 1)) {
            if (!this.hit_ground) this.hit_ground = Date.now()
            return
        }
        this.y_f += (this.gd.speed * this.gd.time_between_ticks()) / 100
        if (this.y < Math.ceil(this.y_f)) {
            this.gd.score += 1
            this.last_move = "down"
        }
        this.y = Math.ceil(this.y_f)
    }

    move_down() {
        if (this._check_collision(0, 1)) {
            if (!this.hit_ground) this.hit_ground = Date.now()
            return false
        }
        this.gd.score += 1
        this.last_move = "down"
        this.y_f += 1
        this.y = Math.ceil(this.y_f)
        return true
    }

    move_left() {
        if (this._check_collision(-1, 0)) {
            return false
        }
        this.last_move = "left"
        this.x -= 1
        return true
    }

    move_right() {
        if (this._check_collision(1, 0)) return false
        this.last_move = "right"
        this.x += 1
        return true
    }

    smash() {
        let blocks = 0
        while (!this.hit_ground) {
            blocks += 1
            this.move_down()
        }
        this.gd.score += blocks * 2
    }

    rotate() {
        let new_shape = []
        for (let i = 0; i < this.shape[0].length; i++) {
            new_shape[i] = []
            for (let j = 0; j < this.shape.length; j++) {
                new_shape[i][j] = this.shape[this.shape.length-j-1][i]
            }
        }
        
        this._try_wall_kick(new_shape)

        this.last_move = "rotate"
        this.shape = new_shape
    }

    store() {
        if (this.swapped) return
        let temp = this.gd.stored_piece
        this.gd.stored_piece = this.gd.active_piece
        this.gd.active_piece = temp
        this.y = -1
        this.y_f = -1
        this.x = Math.floor(this.gd.grid_width / 2) - 2
        this.swapped = true
    }

    get_shadow() {
        //use _check_collision to find the lowest point
        let y_offset = 0
        while (!this._check_collision(0, y_offset)) {
            y_offset += 1
        }
        y_offset -= 1
        return this.y + y_offset
    }

    _check_collision(x_offset, y_offset, shape = this.shape) {
        for (let i = 0; i < shape.length; i++) {
            for (let j = 0; j < shape[i].length; j++) {
                if (shape[i][j] != 0) {
                    if (this.y+i+y_offset < 0) continue
                    if (this.x+j+x_offset < 0 || this.x+j+x_offset >= this.gd.grid_width) return true
                    if (this.y+i+y_offset < 0 || this.y+i+y_offset >= this.gd.grid_height) return true
                    if (this.gd.grid[this.y+i+y_offset][this.x+j+x_offset] != 0) return true
                }
            }
        }
        return false
    }

    _try_wall_kick(shape) {
        if (!this._check_collision(0, 0, shape)) return true
        for (let i = 0; i < 3; i++) {
            if (!this._check_collision(i, 0, shape)) {
                this.x += i
                return true
            }
            if (!this._check_collision(-i, 0, shape)) {
                this.x -= i
                return true
            }
        }
        return false
    }

    save_to_grid() {
        for (let i = 0; i < this.shape.length; i++) {
            for (let j = 0; j < this.shape[i].length; j++) {
                if (this.y+i < 0 || this.y+i >= this.gd.grid_height) continue
                if (this.shape[i][j] != 0) {
                    this.gd.grid[this.y+i][this.x+j] = this.id
                }
            }
        }
    }
}

class PieceI extends Piece {
    id = 1;
    shape = [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ];
}

class PieceJ extends Piece {
    id = 2;
    shape = [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0]
    ];
}

class PieceL extends Piece {
    id = 3;
    shape = [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0]
    ];
}

class PieceO extends Piece {
    id = 4;
    shape = [
        [1, 1],
        [1, 1],
    ];
}

class PieceS extends Piece {
    id = 5;
    shape = [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0]
    ];
}

class PieceZ extends Piece {
    id = 6;
    shape = [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0]
    ];
}

class PieceT extends Piece {
    id = 7;
    shape = [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0],
    ];

    tick() {
        super.tick()
        if (this._t_spin()) {
            this.gd.score += 100
        }
    }

    _t_spin() {
        if (this.last_move != "rotate") return false
        let corners = 0
        for (let i = 0; i < this.shape.length; i+=2) {
            for (let j = 0; j < this.shape[i].length; j+=2) {
                if (this.shape[i][j] != 0) {
                    if (this.gd.grid[this.y+i][this.x+j] != 0) {
                        corners++
                    }
                }
            }
        }
        if (corners >= 3) {
            return true
        }
        return false
    }
}

module.exports = {
    COLORS,
    PieceI,
    PieceJ,
    PieceL,
    PieceO,
    PieceS,
    PieceZ,
    PieceT,
}
