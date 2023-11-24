const RenderHandler = require('./draw.js');
const { PieceI, PieceJ, PieceL, PieceO, PieceS, PieceT, PieceZ } = require('./pieces.js');
const { input_handler, register_input } = require('./input.js');

const gd = {
    PIECES: [PieceI, PieceJ, PieceL, PieceO, PieceS, PieceT, PieceZ],
    STANDARD_FPC: 48,
    NES_FPS: 60,
    SPEED_TABLE: {
        0: 5,
        8: 2,
        9: 1,
        10: 0,
        12: 1,
        13: 0,
        15: 1,
        16: 0,
        18: 1,
        19: 0,
        28: 1,
        29: 0,
    },
    LINE_SCORES: {
        1: 40,
        2: 100,
        3: 300,
        4: 1200,
    },
    storage: null,
    logic_cycle: null,
    last_tick: Date.now(),
    current_tick: Date.now(),
    next_piece: null,
    active_piece: null,
    grid_width: 10,
    grid_height: 22,
    grid: [],
    level: 0,
    lines_cleared: 0,
    score : 0,
    //Each Block equates to 100xy, Speed 100 = 1 block per second
    speed: 100,
    time_between_ticks: function() {
        return (this.current_tick - this.last_tick)/1000
    }
}

function calculate_speed() {
    //nes_fps / frames per cell = cells per second
    //cells per second * 100 = speed
    let last_mod = 0
    let fpc = gd.STANDARD_FPC
    for (let i = 0; i < gd.level; i++) {
        if (gd.SPEED_TABLE.hasOwnProperty(i)) {
            last_mod = gd.SPEED_TABLE[i]
        }
        fpc -= last_mod
    }
    gd.speed = gd.NES_FPS / fpc * 100
}

function calculate_level() {
    if (gd.lines_cleared == 0) return
    gd.level = Math.floor(gd.lines_cleared / 10)
}

function check_rows() {
    let rows_cleared = 0
    for (let i = 0; i < gd.grid.length; i++) {
        let row = gd.grid[i]
        let clear = true
        for (let j = 0; j < row.length; j++) {
            if (row[j] == 0) {
                clear = false
                break
            }
        }
        if (clear) {
            rows_cleared++
            gd.grid.splice(i, 1)
            gd.grid.unshift(new Array(gd.grid_width).fill(0))
        }
    }
    if (rows_cleared > 0) {
        gd.score += gd.LINE_SCORES[rows_cleared] * (gd.level + 1)
        gd.lines_cleared += rows_cleared
    }
}

function logic() {
    gd.score_display.innerHTML = gd.score
    gd.level_display.innerHTML = gd.level
    let spawned = false
    gd.current_tick = Date.now()

    if (gd.active_piece == null) {
        gd.active_piece = gd.next_piece
        gd.next_piece = new gd.PIECES[Math.floor(Math.random() * gd.PIECES.length)](gd)
        spawned = true
    }

    gd.active_piece.tick()

    if (gd.active_piece.hit_ground) {
        if (spawned) reset()
        if (Date.now() - gd.active_piece.hit_ground > 500) {
            if (gd.active_piece._check_collision(0, 1)) {
                gd.active_piece.save_to_grid()
                check_rows()
                gd.active_piece = null
            } else {
                gd.active_piece.hit_ground = null
            }
        }    
    }

    calculate_level()
    calculate_speed()

    input_handler(gd)
    gd.renderer.draw()
    gd.last_tick = gd.current_tick
}

function reset() {
    clearInterval(gd.logic_cycle)
    gd.grid = []
    for (let i = 0; i < gd.grid_height; i++) {
        gd.grid[i] = []
        for (let j = 0; j < gd.grid_width; j++) {
            gd.grid[i][j] = 0
        }
    }
    gd.active_piece = null
    gd.level = 0
    gd.lines_cleared = 0
    gd.score = 0
    gd.logic_cycle = setInterval(logic, 1000/60)
}

function init() {
    gd.playfield = document.getElementById('playfield')
    gd.reservefield = document.getElementById('reserve')
    gd.nextfield = document.getElementById('next')
    gd.score_display = document.getElementById('score')
    gd.level_display = document.getElementById('level')
    gd.grid = []
    for (let i = 0; i < gd.grid_height; i++) {
        gd.grid[i] = []
        for (let j = 0; j < gd.grid_width; j++) {
            gd.grid[i][j] = 0
        }
    }
    register_input()
    gd.next_piece = new gd.PIECES[Math.floor(Math.random() * gd.PIECES.length)](gd)
}

function main() {
    init()
    gd.renderer = new RenderHandler(gd)
    gd.renderer.init()
    gd.logic_cycle = setInterval(logic, 1000/60)
}

main()