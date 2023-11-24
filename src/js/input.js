const key_map = {}

const keybinds = {
    'left': ['37', '65'],
    'right': ['39', '68'],
    'down': ['40', '83'],
    'rotate': ['38', '87'],
    'smash': ['32'],
    'store': ['16']
}
const reversed_bindings = {}

function keydown(event) {
    if (key_map.hasOwnProperty(event.keyCode) && key_map[event.keyCode][0]) return
    key_map[event.keyCode] = true
}

function keyup(event) {
    delete key_map[event.keyCode]
}

const delay = 150
function input_handler(gd) {
    for (let key in key_map) {
        if (!reversed_bindings.hasOwnProperty(key)) continue
        const action = reversed_bindings[key]
        if (keybinds[action].last_pressed + delay > Date.now()) continue
        switch (action) {
            case 'left':
                gd.active_piece.move_left()
                break
            case 'right':
                gd.active_piece.move_right()
                break
            case 'down':
                gd.active_piece.move_down()
                break
            case 'rotate':
                gd.active_piece.rotate()
                break
            case 'smash':
                gd.active_piece.smash()
                break
            case 'store':
                gd.active_piece.store()
                break
        }
        keybinds[action].last_pressed = Date.now()
    }
}


function register_input() {
    for (let binding in keybinds) {
        for (let key of keybinds[binding]) {
            reversed_bindings[key] = binding
        }
        keybinds[binding] = {
            'keys': keybinds[binding],
            'last_pressed': 0
        }
    }
    document.addEventListener('keydown', keydown)
    document.addEventListener('keyup', keyup)
}

module.exports = { input_handler, register_input }
