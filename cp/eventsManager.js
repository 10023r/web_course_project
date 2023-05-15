let eventsManager = {
    bind: [],
    action: [],
    setup() {
        this.bind[87] = 'up'  // W
        this.bind[65] = 'left'  // A
        this.bind[83] = 'down'  // S
        this.bind[68] = 'right'  // D
        this.bind[32] = 'plant'
        document.body.addEventListener("keydown", this.onKeyDown)
        document.body.addEventListener("keyup", this.onKeyUp)
    },
    onKeyDown(event) {
        let action = eventsManager.bind[event.keyCode]
        if (action)
            eventsManager.action[action] = true
    },
    onKeyUp(event) {
        let action = eventsManager.bind[event.keyCode]
        if (action)
            eventsManager.action[action] = false
    }
}