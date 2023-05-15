let physicsManager = {
    tileIntersection(x, y, dirX, dirY) {
        if (dirX > 0) {
            let right = [mapManager.getTilesetIdx(x + 28, y + 4), mapManager.getTilesetIdx(x + 28, y + 28)]
            if (right[0][0] === 2 && right[0][1] !== 6 && right[1][0] === 2 && right[1][1] !== 6) {
                return false
            }
        } else if (dirX < 0) {
            let left = [mapManager.getTilesetIdx(x + 4, y + 4), mapManager.getTilesetIdx(x + 4, y + 28)]
            if (left[0][0] === 2 && left[0][1] !== 6 && left[1][0] === 2 && left[1][1] !== 6) {
                return false
            }
        } else if (dirY < 0) {
            let up = [mapManager.getTilesetIdx(x + 4, y + 2), mapManager.getTilesetIdx(x + 28, y + 2)]
            if (up[0][0] === 2 && up[0][1] !== 6 && up[1][0] === 2 && up[1][1] !== 6) {
                return false
            }
        } else if (dirY > 0) {
            let down = [mapManager.getTilesetIdx(x + 4, y + 30), mapManager.getTilesetIdx(x + 28, y + 30)]
            if (down[0][0] === 2 && down[0][1] !== 6 && down[1][0] === 2 && down[1][1] !== 6) {
                return false
            }
        }

        return true
    },


    update(obj) {
        if (obj.move_x === 0 && obj.move_y === 0 && !gameManager.player.planted) {
            return "stop"
        }
        let newX = obj.pos_x + Math.floor(obj.move_x * obj.speed)
        let newY = obj.pos_y + Math.floor(obj.move_y * obj.speed)

        let ts = mapManager.getTilesetIdx(newX + obj.size_x / 2, newY + obj.size_y / 2)

        let e = this.entityAtXY(obj, newX, newY)
        if (e !== null && obj.onTouchEntity) {
            obj.onTouchEntity(e)
        }

        if (ts[1] !== 0 && obj.onTouchMap) {  // если коснулись бонуса или НЕ коробки
            obj.onTouchMap(ts, newX, newY)
        } else if (this.tileIntersection(newX, newY, obj.move_x, obj.move_y)) {
            if (obj.changeDirection)
                obj.changeDirection()
            return "break"
        }
        // все чисто, идем дальше
        obj.pos_x = newX
        obj.pos_y = newY
        return "move"

    },
    entityAtXY(obj, x, y) {
        for (let i = 0; i < gameManager.entities.length; ++i) {
            let e = gameManager.entities[i]
            if (e.name !== obj.name) {
                if (Math.abs(x - e.pos_x) <= 20 && Math.abs(y - e.pos_y) <= 20)
                    return e
            }
        }
        return null
    }
}