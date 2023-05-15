let canvas = document.getElementById('canvasId')
let ctx = canvas.getContext("2d")
const pathToLevelMap = [
    "cp/tiled_data/map1.json",
    "cp/tiled_data/map2.json"
]
const pathToAudios = [
    "cp/audios/bg_audio.mp3",
    "cp/audios/explosion.mp3",
    "cp/audios/bonus.mp3",
]
const tiledDir = 'cp/tiled_data/'


function updateWorld() {

    gameManager.update()
    menuManager.updateScoreTable(gameManager.level, gameManager.score)
}

gameManager.play(pathToLevelMap[0])

