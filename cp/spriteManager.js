let spriteManager = {
    image: new Image(),
    sprites: [],
    imgLoaded: false,
    jsonLoaded: false,
    loadAtlas(atlasJson, atlasImg) {
        let req = new XMLHttpRequest()
        req.onreadystatechange = function () {
            if (req.readyState === 4 && req.status === 200) {
                spriteManager.parseAtlas(req.responseText)
            }
        }
        req.open("GET", atlasJson, true)
        req.send()
        this.loadImg(atlasImg)
    },  // загрузка аталаса
    loadImg(imgName) {
        this.image.onload = function () {
            spriteManager.imgLoaded = true
        }
        this.image.src = imgName
    },  // загрузка изображения

    parseAtlas(atlasJSON) {
        let atlas = JSON.parse(atlasJSON)
        for (let nameI in atlas.frames) {
            let frame = atlas.frames[nameI].frame
            this.sprites.push({name: nameI, x: frame.x, y: frame.y, w: frame.w, h: frame.h})
        }
        this.jsonLoaded = true
    },  // парсинг атласа

    drawSprite(ctx, name, x, y, isBg=false) {
        if (!this.imgLoaded || !this.jsonLoaded) {
            setTimeout(function () {spriteManager.drawSprite(ctx, name, x, y)}, 100)
        } else {
            let sprite = this.getSprite(name)
            if (isBg) {
                ctx.fillStyle = "red"
                ctx.fillRect(x, y, sprite.w, sprite.h)

            }
            if (sprite)
                ctx.drawImage(this.image, sprite.x, sprite.y, sprite.w, sprite.h, x, y, sprite.w, sprite.h)
            else
                console.log(name, 'not found')
        }
    },  // прорисовка спрайта
    getSprite(name) {
        for (let i = 0; i < this.sprites.length; i++) {
            let s = this.sprites[i]
            if (s.name === name) { return s }
        }
        return null
    }  // получение спрайта по имени
}