class Entity {
    constructor() {
        this.name = ''
        this.pos_x = 0;
        this.pos_y = 0;
        this.size_x = 0;
        this.size_y = 0;
    }
}

class Player extends Entity {
    constructor() {
        super()
        this.move_x = 0
        this.move_y = 0
        this.speed = 8
        this.alive = true
        this.bombRange = 5
        this.planted = false
        this.hasArmor = false
        this.sprite = {
            name: 'player_down_1',
            i: 0
        }
    }

    animation(direction, num) {
        if (this.sprite.name.indexOf(direction) > -1 && this.sprite.i < num) {
            this.sprite.i++
            this.sprite.name = `player_${direction}_${this.sprite.i}`
        } else {
            this.sprite.name = `player_${direction}_1`
            this.sprite.i = 1
        }
    }

    draw(ctx) {
        if (this.move_x === 1) {
            this.animation("right", 4)
        } else if (this.move_x === -1) {
            this.animation("left", 4)
        } else if (this.move_y === -1) {
            this.animation("up", 3)
        } else if (this.move_y === 1) {
            this.animation("down", 3)
        }
        spriteManager.drawSprite(ctx, this.sprite.name, this.pos_x, this.pos_y, this.hasArmor)
    }
    update() {
        physicsManager.update(this)
    }
    onTouchEntity(obj) {
        if (obj.name.indexOf("enemy_") > -1) {
            this.kill()
        } else if (obj.type === 'flame') {
            this.bombRange++
            gameManager.score += 10
            soundManager.clips[pathToAudios[2]].play(false)
            obj.kill()
        } else if (obj.type === 'armor') {
            gameManager.score += 10
            this.hasArmor = true
            soundManager.clips[pathToAudios[2]].play(false)
            obj.kill()
        } else if (obj.type === "gate" && gameManager.enemiesCount === 0) {  // go to next level
            gameManager.score += 300
            gameManager.levelUp()
        }
    }

    onTouchMap(tsIdx) {
        if (tsIdx[1] === 55 || tsIdx[1] === 52 || tsIdx[1] === 43) {
            if (!this.hasArmor)
                this.kill()
        }
    }

    kill() {
        if (this.alive) {
            gameManager.gameOver()
            this.alive = false
            gameManager.laterKill.push(this)
        }
    }
    plantBomb() {
        if (!this.planted  && this.alive) {
            let b = new Bomb()
            b.size_x = 32
            b.size_y = 32
            b.pos_x = Math.floor((this.pos_x + this.size_x/2) / 32) * 32
            b.pos_y = Math.floor((this.pos_y + this.size_y/2) / 32) * 32
            b.range = this.bombRange
            gameManager.entities.push(b)
            this.planted = true
        }
    }

}  // игрок

class Enemy extends Entity {
    constructor() {
        super()
        this.speed = 4
        this.move_x = 0
        this.move_y = 1
        this.type = ""
        this.alive = true
        this.sprite = {
            name: "",
            i: 1
        }
        this.intervalID = setInterval(() => {
            this.changeDirection()
        }, (5 + Math.floor(Math.random() * 5)) * 1000)
    }

    changeDirection() {
        let dir = Math.floor(Math.random() * 4)  // 4  directions
        switch (dir) {
            case 0:  // up
                this.move_y = -1
                this.move_x = 0
                break
            case 1:  // left
                this.move_x = -1
                this.move_y = 0
                break
            case 2:
                this.move_y = 1
                this.move_x = 0
                break
            case 3:
                this.move_x = 1
                this.move_y = 0
                break
        }
        clearInterval(this.intervalID)  // resetting interval
        this.intervalID = setInterval(() => {
            this.changeDirection()
        }, (5 + Math.floor(Math.random() * 5)) * 1000)
    }



    animation(direction, num) {
        if (this.sprite.name.indexOf(direction) > -1 && this.sprite.i < num) {
            this.sprite.i++
            this.sprite.name = `${this.type}_${direction}_${this.sprite.i}`
        } else {
            this.sprite.name = `${this.type}_${direction}_1`
            this.sprite.i = 1
        }
    }

    draw(ctx) {
        if (this.move_x === 1) {
            this.animation("right", 4)
        } else if (this.move_x === -1) {
            this.animation("left", 4)
        } else if (this.move_y === -1) {
            this.animation("up", 3)
        } else if (this.move_y === 1) {
            this.animation("down", 3)
        }
        spriteManager.drawSprite(ctx, this.sprite.name, this.pos_x, this.pos_y)
    }
    update() {
        physicsManager.update(this)
    }
    onTouchEntity(obj) {
        if (obj.name.indexOf("Player") > -1) {
            obj.kill()
        }
    }
    onTouchMap(tsIdx) {
        if (tsIdx[1] === 55 || tsIdx[1] === 52 || tsIdx[1] === 43) {
            this.kill()
            gameManager.score += 50
            gameManager.enemiesCount--
        }

    }
    kill() {
        if (this.alive) {
            this.alive = false
            gameManager.laterKill.push(this)
            clearInterval(this.intervalID)
        }
    }
}  // враги

class Bonus extends Entity {
    constructor() {
        super()
        this.type = ''
    }
    draw(ctx) {
        spriteManager.drawSprite(ctx, this.type, this.pos_x, this.pos_y)
    }

    kill() {
        gameManager.laterKill.push(this)
    }
}  // Бонусы

class Bomb extends Entity {
    constructor() {
        super()
        this.name = 'bomb'
        this.range = 1
        this.timer = 3000 // ms = 3 seconds
        this.animation = {
            name: "bomb_",
            i: 1
        }
        this.intervalID = setInterval(() => {
            this.animation.i++
        }, this.timer / 6)  // 6 == num of sprites for animation
        this.isExploded = false
        this.isFlameDisplayed = false
    }


    draw(ctx) {
        if (!this.isExploded) {
            if (this.animation.i <= 6)
                spriteManager.drawSprite(ctx, this.animation.name + this.animation.i, this.pos_x, this.pos_y)
            else {
                clearInterval(this.intervalID)
                this.explode()
            }
        } else {
            if (!this.isFlameDisplayed) {
                this.displayFlame()
                this.isFlameDisplayed = true
            }
        }

    }

    displayFlame() {
        let center = mapManager.getDataIdx(this.pos_x, this.pos_y)
        mapManager.tLayer[1].data[center] = 43  // center flame sprite code
        let r = 1
        let spread = {top: true, left: true, bot: true, right: true}
        for ( ; r < this.range + 1; r++) {
            let bot = mapManager.getTilesetIdx(this.pos_x, this.pos_y + this.size_y * r)
            if (bot[0] === 2 && spread.bot) {
                let di = mapManager.getDataIdx(this.pos_x, this.pos_y + this.size_y * r)
                mapManager.tLayer[1].data[di] = 55  // vert flame sprite code
                spread.bot = bot[1] === 0
            }
            else
                spread.bot = false

            let top = mapManager.getTilesetIdx(this.pos_x, this.pos_y - this.size_y * r)
            if (top[0] === 2 && spread.top) {
                let di = mapManager.getDataIdx(this.pos_x, this.pos_y - this.size_y * r)
                mapManager.tLayer[1].data[di] = 55  // vert flame sprite code
                spread.top = top[1] === 0
            }
            else
                spread.top = false

            let right = mapManager.getTilesetIdx(this.pos_x + this.size_x * r, this.pos_y)
            if (right[0] === 2 && spread.right) {
                let di = mapManager.getDataIdx(this.pos_x + this.size_x * r, this.pos_y)
                mapManager.tLayer[1].data[di] = 52  // horizontal flame sprite code
                spread.right = right[1] === 0
            }
            else
                spread.right = false

            let left = mapManager.getTilesetIdx(this.pos_x - this.size_x * r, this.pos_y)
            if (left[0] === 2 && spread.left) {
                let di = mapManager.getDataIdx(this.pos_x - this.size_x * r, this.pos_y)
                mapManager.tLayer[1].data[di] = 52  // horizontal flame sprite code
                spread.left = left[1] === 0
            }
            else
                spread.left = false
        }
    }

    explode() {
        this.isExploded = true
        soundManager.clips[pathToAudios[1]].play(false)
        setTimeout(() => {
            gameManager.player.planted = false
            gameManager.laterKill.push(this)
            let center = mapManager.getDataIdx(this.pos_x, this.pos_y)
            mapManager.tLayer[1].data[center] = 0
            let r = 1
            for ( ; r < this.range + 1; r++) {
                let bot = mapManager.getDataIdx(this.pos_x, this.pos_y + this.size_y * r)
                mapManager.tLayer[1].data[bot] = mapManager.tLayer[1].data[bot] === 55 ? 0 : mapManager.tLayer[1].data[bot]

                let top = mapManager.getDataIdx(this.pos_x, this.pos_y - this.size_y * r)
                mapManager.tLayer[1].data[top] = mapManager.tLayer[1].data[top] === 55 ? 0 : mapManager.tLayer[1].data[top]


                let right = mapManager.getDataIdx(this.pos_x + this.size_x * r, this.pos_y)
                mapManager.tLayer[1].data[right] = mapManager.tLayer[1].data[right] === 52 ? 0 : mapManager.tLayer[1].data[right]


                let left = mapManager.getDataIdx(this.pos_x - this.size_x * r, this.pos_y)
                mapManager.tLayer[1].data[left] = mapManager.tLayer[1].data[left] === 52 ? 0 : mapManager.tLayer[1].data[left]
            }

        }, 500)
    }
}  // бомбы
