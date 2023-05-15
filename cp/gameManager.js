let gameManager = {
    level: 1,
    score: 0,
    initPlayer(obj) {
        if (this.player) {
            obj.hasArmor = this.player.hasArmor
            obj.bombRange = this.player.bombRange
        }
        this.player = obj
    },
    kill(obj) {
        this.laterKill.push(obj)
    },
    draw(ctx) {
        for (let e = 0; e < this.entities.length; e++) {
            this.entities[e].draw(ctx)
        }
    },
    update() {
        if (this.player === null)
            return
        this.player.move_x = 0
        this.player.move_y = 0
        if (eventsManager.action["up"]) this.player.move_y = -1
        else if (eventsManager.action["down"]) this.player.move_y = 1
        else if (eventsManager.action["left"]) this.player.move_x = -1
        else if (eventsManager.action["right"]) this.player.move_x = 1

        if (eventsManager.action["plant"]) this.player.plantBomb()

        this.entities.forEach(function (e) {
            try {
                if (e.update)
                    e.update()
            } catch (ex) {
                console.log("error during updating entities in gameManager", ex, e)
            }
        })

        for (let i = 0; i < this.laterKill.length; i++) {
            let idx = this.entities.indexOf(this.laterKill[i])
            if (idx > -1)
                this.entities.splice(idx, 1)
        }
        if (this.laterKill.length > 0) this.laterKill.length = 0
        mapManager.drawMap(ctx)
        this.draw(ctx)
    },
    loadAll(levelPath) {
        this.factory = {}
        this.entities = []
        this.laterKill = []
        this.gameIntervalId = null
        this.enemiesCount = 0
        mapManager.loadMap(levelPath)
        spriteManager.loadAtlas(tiledDir + "atlas.json", tiledDir + "spritesheet.png")
        gameManager.factory['Player'] = Player
        gameManager.factory['Enemy'] = Enemy
        gameManager.factory['Bonus'] = Bonus
        mapManager.parseEntities()
        mapManager.drawMap(ctx)
        eventsManager.setup(canvas)
        menuManager.initMenuTables()
    },
    play(lvlPath) {
        // audioManager.loadSound(pathToAudios[0])
        this.loadAll(lvlPath)
        this.gameIntervalId = setInterval(updateWorld, 100)
    },
    levelUp() {
        clearInterval(this.gameIntervalId)
        this.level++
        if (this.level <= pathToLevelMap.length) {
            this.play(pathToLevelMap[this.level - 1])
        } else { // game passed
            menuManager.gamePassed()
            menuManager.saveRecord(this.score)
            menuManager.writeRecord(this.score)
        }
    },

    gameOver() {
        menuManager.gameOver()
        menuManager.saveRecord(this.score)
        menuManager.writeRecord(this.score)
    }

}
