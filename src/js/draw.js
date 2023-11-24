const { COLORS } = require('./pieces.js')

class RenderHandler {
    fallback_shape = [
        [0,0,0],
        [0,0,0],
        [0,0,0],
    ]

    constructor(gd) {
        this.gd = gd
    }

    init() {
        for (let i = 0; i < this.gd.grid.length-2; i++) {
            let row = document.createElement('div')
            row.setAttribute('class', 'row')
            for (let j = 0; j < this.gd.grid[i].length; j++) {
                let block = document.createElement('div')
                block.setAttribute('class', 'block')
                row.appendChild(block)
            }
            this.gd.playfield.appendChild(row)
        }
    }

    rm_empty(shape) {
        let new_shape = []
        for (let i = 0; i < shape.length; i++) {
            let empty = true
            for (let j = 0; j < shape[i].length; j++) {
                if (shape[i][j] != 0) {
                    empty = false
                    break
                }
            }
            if (!empty) new_shape.push(shape[i])
        }
        return new_shape
    }

    mininomiono(display_element, shape, color) {
        if (shape == null) return
        shape = this.rm_empty(shape)
        if (shape.length == 0) return
        let length = shape[0].length
        display_element.innerHTML = ''
        let width = (display_element.offsetWidth)
        let height = width / length
        let border = 0.05 * height
        let margin = (width - (height * shape.length)) / 2
        let rowHeight = height - border
        for (let i = 0; i < shape.length; i++) {
            let row = document.createElement('div')
            row.setAttribute('class', 'row')
            row.style.width = width + 'px'
            row.style.height = rowHeight + 'px'
            for (let j = 0; j < shape[i].length; j++) {
                let block = document.createElement('div')
                block.setAttribute('class', 'block')
                block.style.width = rowHeight  * 0.90 + 'px'
                block.style.height = rowHeight * 0.90 + 'px'
                block.style.borderWidth = border + 'px'
                if (shape[i][j] != 0) {
                    block.style.backgroundColor = color
                } else {
                    block.style.backgroundColor = 'black'
                }
                row.appendChild(block)
            }
            display_element.appendChild(row)
            if (i == 0) row.style.marginTop = margin + 'px'
        }
    }

    draw() {
        if (this.gd.stored_piece == null) this.mininomiono(this.gd.reservefield, this.fallback_shape)
        else this.mininomiono(this.gd.reservefield, this.gd.stored_piece.shape, COLORS[this.gd.stored_piece.id])

        if (this.gd.next_piece == null) this.mininomiono(this.gd.nextfield, this.fallback_shape)
        else this.mininomiono(this.gd.nextfield, this.gd.next_piece.shape, COLORS[this.gd.next_piece.id])

        for (let i = 2; i < this.gd.grid.length; i++) {
            for (let j = 0; j < this.gd.grid[i].length; j++) {
                if (this.gd.grid[i][j] != 0) {
                    this.gd.playfield.children[i-2].children[j].style.backgroundColor = COLORS[this.gd.grid[i][j]]
                } else {
                    this.gd.playfield.children[i-2].children[j].style.backgroundColor = 'black'
                }
            }
        }

        if (this.gd.active_piece == null) return
        const piece_x = Math.ceil(this.gd.active_piece.x)
        const piece_y = Math.ceil(this.gd.active_piece.y)
        const piece_shape = this.gd.active_piece.shape

        const shadow_y = this.gd.active_piece.get_shadow()
        for (let i = 0; i < piece_shape.length; i++) {
            for (let j = 0; j < piece_shape[i].length; j++) {
                if (shadow_y+i-2 < 0) {
                    continue
                }
                if (piece_shape[i][j] != 0) {
                    this.gd.playfield.children[shadow_y+i-2].children[piece_x+j].style.backgroundColor = "#a6a6a6"
                }
            }
        }

        for (let i = 0; i < piece_shape.length; i++) {
            for (let j = 0; j < piece_shape[i].length; j++) {
                if (piece_y+i-2 < 0) {
                    continue
                }
                if (piece_shape[i][j] != 0) {
                    this.gd.playfield.children[piece_y+i-2].children[piece_x+j].style.backgroundColor = COLORS[this.gd.active_piece.id]
                }
            }
        }
    }
}

module.exports = RenderHandler