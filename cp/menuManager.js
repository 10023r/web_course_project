let menuManager = {
    player: '',
    initMenuTables() {
        if (!this.player) {
            this.scoreTable = document.getElementById("scoreTableContainer").children
            this.recordsTable = document.getElementsByTagName('tbody')[0]
            if (localStorage.length) {
                let records = JSON.parse(localStorage['records'])
                let players = []
                for (let i in records) {
                    players.push(records[i])
                }
                players.sort((a, b) => {return b[1] - a[1]})
                for (let i = 0; i < players.length; i++) {
                    this.writeRecord(players[i][1], players[i][0])
                }
            }
            this.gamePassedMsg = document.getElementById('gamePassed')
            this.gameOverMsg = document.getElementById('gameOver')
            let params = window
                .location
                .search
                .replace('?','')
                .split('&')
                .reduce(
                    function(p,e){
                        let a = e.split('=');
                        p[ decodeURIComponent(a[0])] = decodeURIComponent(a[1]);
                        return p;
                    },
                    {}
                );
            this.player = params['player']
            soundManager.init()
            this.muteBtn = document.getElementById("volBtn")
            this.muteBtn.addEventListener('click', () => {
                if (soundManager.toggleMute()) { // volume on
                    this.muteBtn.children[0].src = "cp/img/vol_on.png"
                    soundManager.clips[pathToAudios[0]].play(true)
                } else {
                    soundManager.stopAll()
                    this.muteBtn.children[0].src = "cp/img/vol_off.png"
                }
            })
        }

    },
    updateScoreTable(lvl, score) {
        this.scoreTable[1].textContent = `Level: ${lvl}`
        this.scoreTable[2].textContent = `Score: ${score}`
        this.scoreTable[3].textContent = `Player: ${this.player}`
    },
    saveRecord(score, p=this.player) {
        if (localStorage.length) {
            let records = JSON.parse(localStorage['records'])
            let newID = Object.keys(records).length
            records[newID] = [p, score]
            localStorage['records'] = JSON.stringify(records)
        } else {
            localStorage['records'] = JSON.stringify({
                0: [this.player, score]
            })
        }
    },
    writeRecord(score, p=this.player) {
        let td1 = document.createElement('td')
        td1.textContent = p
        let td2 = document.createElement('td')
        td2.textContent = score
        let tr = document.createElement('tr')
        tr.append(td1, td2)
        if (this.recordsTable.children.length) {
            for (let i = 0; i < this.recordsTable.children.length; i++) {
                if (this.recordsTable.children[i].children[1].textContent < score) {
                    this.recordsTable.insertBefore(tr, this.recordsTable.children[i])
                    return
                }
            }
        }
        this.recordsTable.append(tr)
    },
    gameOver() {
        this.gameOverMsg.style.display = 'block'
    },
    gamePassed() {
        this.gamePassedMsg.style.display = 'block'
    },

}