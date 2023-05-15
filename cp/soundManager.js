let soundManager = {
    clips: {},
    context: null,
    gainNode: null,
    loaded: false,
    isPlayingBgMusic: false,
    init() {
        this.context = new AudioContext()
        this.gainNode = this.context.createGain ? this.context.createGain() : this.createGainNode()
        this.gainNode.connect(this.context.destination)
        this.gainNode.gain.value = 0
        this.loadArray(pathToAudios)
    },
    load(path, callback) {
        if (this.clips[path]) {
            callback(this.clips[path])
            return
        }
        let clip = {path: path, buffer: null, loaded: false}
        clip.play = (loop) => {
            this.play(path, {looping: loop ? loop : false})
        }
        this.clips[path] = clip
        let req = new XMLHttpRequest()
        req.open("GET", path, true)
        req.responseType = "arraybuffer"
        req.onload = () => {
            this.context.decodeAudioData(req.response, function (buffer) {
                clip.buffer = buffer
                clip.loaded = true
                callback(clip)
            })
        }
        req.send()

    },
    loadArray(array) {
        for (let i = 0; i < array.length; i++) {
            this.load(array[i], function () {
                if (array.length === Object.keys(soundManager.clips).length) {
                    for (let sd in soundManager.clips)
                        if (!soundManager.clips[sd].loaded) return
                    soundManager.loaded = true
                }
            })
        }
    },
    play(path, settings) {
        if (!this.loaded) {
            setTimeout(() => {
                this.play(path, settings)
            }, 1000)
            return
        }
        let looping = false
        let vol = this.gainNode.gain.value
        if (settings) {
            if (settings.looping)
                looping = settings.looping
        }
        let clip = this.clips[path]
        if (clip === null)
            return false
        let sound = this.context.createBufferSource()
        sound.buffer = clip.buffer
        sound.connect(this.gainNode)
        sound.loop = looping
        this.gainNode.gain.value = vol
        sound.start(0)
        return true
    },
    toggleMute() {
        if (this.gainNode.gain.value > 0) {
            this.gainNode.gain.value = 0
            return false
        }
        this.gainNode.gain.value = 1
        return true
    },
    stopAll() {
        this.gainNode.disconnect()
        this.gainNode = this.context.createGain ? this.context.createGain() : this.createGainNode()
        this.gainNode.connect(this.context.destination)
        this.gainNode.gain.value = 0
    }
}