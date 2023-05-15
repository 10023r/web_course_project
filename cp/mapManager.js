let mapManager = {
    xCount: 0,
    yCount: 0,
    tSize: {x: 32, y: 32},
    mapSize: {x: 32, y: 32},
    tileSets: []
}

mapManager.parseImageObj = function (image, t) {
    let req = new XMLHttpRequest()
    req.onreadystatechange = () => {
        if (req.readyState === 4 && req.status === 200) {
            let res = JSON.parse(req.responseText)
            image.src =  tiledDir + res.image
            let ts = {
                firstgid: t.firstgid,
                image: image,
                name: res.name,
                xCount: Math.floor(res.imagewidth / mapManager.tSize.x),
                yCount: Math.floor(res.imageheight / mapManager.tSize.y)
            }
            this.tileSets.push(ts)
        }
    }
    req.open("GET", tiledDir + t.source, false)
    req.send()
}  // парсинг тайлсетов

mapManager.loadImage = function (t) {
    let img = new Image()
    img.onload =  () => {
        this.imgCount++;
        if (this.imgCount === this.mapData.tilesets.length) {
            this.isLoaded = true
            delete this.imgCount
        }
    }
    this.parseImageObj(img, t)
}  // загрузка тайлсетов

mapManager.parseMap = function (tilesJSON)  { // парсинг карты из tiled
    this.mapData = JSON.parse(tilesJSON)
    this.tLayer = null
    this.xCount = this.mapData.width // ширина карты в тайлах (=17)
    this.yCount = this.mapData.height // высота карты в тайлах  (=17)
    this.tSize.x = this.mapData.tilewidth // ширина тайла в пикселях (=32)
    this.tSize.y = this.mapData.tileheight // высота тайла в пикселях (=32)
    this.mapSize.x = this.xCount * this.tSize.x // ширина карты в пикселях (17 * 32)
    this.mapSize.y = this.yCount * this.tSize.x // высота карты в пикселях (17 * 32)

    this.imgCount = 0
    for (let i = 0; i < this.mapData.tilesets.length; i++) {
        this.loadImage(this.mapData.tilesets[i])
    }
}  // парсинг карты

mapManager.loadMap = function (path) {
    let req = new XMLHttpRequest()
    req.onreadystatechange = () => {
        if (req.readyState === 4 && req.status === 200) {
            this.parseMap(req.responseText)
        }
    }
    req.open("GET", path, false)
    req.send()
}  // загрузка карты

mapManager.getTileset = function (tileIndex) {
    for (let i = this.tileSets.length - 1; i >= 0; --i) {
        if (this.tileSets[i].firstgid <= tileIndex) {
            return this.tileSets[i]
        }
    }
    return null
}

mapManager.getTile = function (tileIndex) {
    let tile = {
        img: null,
        px: 0,
        py: 0
    }
    let tileset = this.getTileset(tileIndex)
    tile.img = tileset.image
    let id = tileIndex - tileset.firstgid
    let x = id % tileset.xCount
    let y = Math.floor(id / tileset.xCount)
    tile.px = x * mapManager.tSize.x  // координата х тайла в рисунке
    tile.py = y * mapManager.tSize.y  // координата у тайла в рисунке
    return tile
}

mapManager.drawMap = function (ctx) {
    if (!this.isLoaded) {
        setTimeout( () => { this.drawMap(ctx) }, 100)
    } else {
        if (this.tLayer === null) {
            this.tLayer = []
            for (let i = 0; i < this.mapData.layers.length; i++) {
                let layer = this.mapData.layers[i]
                if (layer.type === "tilelayer") {
                    this.tLayer.push(layer)
                }
            }
        }
        const dataLen = this.tLayer[0].data.length
        for (let i = 0; i < dataLen; i++) {
            for (let layer = 0; layer < this.tLayer.length; layer++) {
                if (this.tLayer[layer].data[i] !== 0) {
                    let tile = this.getTile(this.tLayer[layer].data[i])
                    let pX = (i % this.xCount) * this.tSize.x  // координат на холсте
                    let pY = Math.floor(i / this.xCount) * this.tSize.y
                    ctx.drawImage(tile.img, tile.px, tile.py, this.tSize.x, this.tSize.y, pX, pY, this.tSize.x, this.tSize.y)
                }
            }
        }
    }
}  // отрисовка карты

mapManager.parseEntities = function () {
    if (!this.isLoaded) {
        setTimeout( () => { this.parseEntities() }, 100)
    } else {
        for (let j = 0; j < this.mapData.layers.length; j++) {
            if (this.mapData.layers[j].type === 'objectgroup') {
                let entity = this.mapData.layers[j]
                for (let i = 0; i < entity.objects.length; i++) {
                    let e = entity.objects[i]
                    try {
                        let obj = new gameManager.factory[e.class] // Object.create(gameManager.factory[e.class])
                        obj.name = e.name
                        obj.pos_x = e.x
                        obj.pos_y = e.y
                        obj.size_x = e.width
                        obj.size_y = e.height
                        gameManager.entities.push(obj)
                        if (obj.name === 'Player') {
                            gameManager.initPlayer(obj)
                        } else if (e.class === "Bonus") {
                            obj.type = e.name.toLowerCase().replace(/[0-9]/g, '')
                        } else if (e.class === 'Enemy') {
                            gameManager.enemiesCount++
                            obj.type = e.name.toLowerCase().replace(/[0-9]/g, '')
                            obj.sprite.name = `${obj.type}_down_1`
                        }
                    } catch (ex) {
                        console.log("Error while creating: [" + e.gid + "]" + e.type + ", " + ex)
                    }
                }
            }
        }
    }
}  // парсинг сущностей (объектов)

mapManager.getDataIdx = function (x, y) {
    return Math.floor(y / this.tSize.y) * this.xCount + Math.floor(x / this.tSize.x)
}

mapManager.getTilesetIdx = function (x, y) {
    let idx = Math.floor(y / this.tSize.y) * this.xCount + Math.floor(x / this.tSize.x)
    return [this.tLayer[0].data[idx], this.tLayer[1].data[idx]]
}