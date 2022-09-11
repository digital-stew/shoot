/** @type {HTMLCanvasElement} */
const debug = true

const canvas = document.getElementById('game-canvas')
const ctx = canvas.getContext('2d')

const hitBoxCanvas = document.getElementById('hitBox-canvas')
const hitBoxCtx = hitBoxCanvas.getContext('2d')

const scoreElement = document.getElementById('score')

// document.body.style.cursor = 'none';

const CANVAS_WIDTH = hitBoxCanvas.width = canvas.width = 1366
const CANVAS_HEIGHT = hitBoxCanvas.height = canvas.height = 768

// const CANVAS_WIDTH = hitBoxCanvas.width = canvas.width = 800
// const CANVAS_HEIGHT = hitBoxCanvas.height = canvas.height = 600

const startBtn = document.querySelector('.startBtn')
const startScreen = document.querySelector('.startScreen')
const nasaOverlay = document.querySelector('.nasa-overlay')


getImage()
startBtn.addEventListener('click', startGame)


let enemySpawnId
let enemySpawnId2
let nasaOverlayOpacity = 1



let score = 0;
let timeLastFrame
let speed = 1;
let endGame = false
const red = "#FF0000"
const blue = "#0000FF"
const green = "#00FF00"
const black = "#000000"
const white = "#FFFFFF"

const playerImg = new Image()
playerImg.src = './player/ship.png'
const player = {
    'X': 0,
    'Y': 0,
    'up': false,
    'down': false,
    'left': false,
    'right': false,
    'shoot': false,
    'speed': 5,
    'timeLastFire': 0,
    'colour': blue,
    'spriteWidth': 150,
    'spriteHeight': 125,
    'frameWidth': 375,
    'frameHeight': 340,
    'centreFrame': 4,
    'powerupsCollected': 0,

    draw() {

        if (this.up) {
            ctx.drawImage(playerImg, 1 * this.frameWidth, 0, this.frameWidth, this.frameHeight, this.X, this.Y, this.spriteWidth, this.spriteHeight);
        } else if (this.down) {
            ctx.drawImage(playerImg, 7 * this.frameWidth, 0, this.frameWidth, this.frameHeight, this.X, this.Y, this.spriteWidth, this.spriteHeight);
        } else {
            ctx.drawImage(playerImg, 3 * this.frameWidth, 0, this.frameWidth, this.frameHeight, this.X, this.Y, this.spriteWidth, this.spriteHeight);

        }
        if (this.right == true) {
            ctx.fillStyle = blue
            ctx.fillRect(this.X - 9, this.Y + 15, 20, 5)
            ctx.beginPath();
            ctx.arc(this.X - 10, this.Y + 15, 5, 0, 2 * Math.PI, false);
            ctx.fill();
        }

        // ctx.fillStyle = this.colour
        // ctx.fillRect(this.X, this.Y, 50, 50);
        hitBoxCtx.fillStyle = "rgb(001,001,001)" //16
        hitBoxCtx.fillRect(this.X, this.Y, 50, this.spriteHeight);
    },
    update(time) {
        if (this.up) this.Y -= 1 * this.speed
        if (this.down) this.Y += 1 * this.speed
        if (this.left) this.X -= 1 * this.speed
        if (this.right) this.X += 1 * this.speed
        if (this.shoot) this.fire(time)
        if (this.X < 0) this.X = 0
        if (this.X > CANVAS_WIDTH - this.spriteWidth) this.X = CANVAS_WIDTH - this.spriteWidth
        if (this.Y < 0) this.Y = 0
        if (this.Y > CANVAS_HEIGHT - this.spriteHeight) this.Y = CANVAS_HEIGHT - this.spriteHeight

        let detectPowerup = hitBoxCtx.getImageData(this.X, this.Y, this.spriteWidth, this.spriteHeight).data.filter((i) => {
            if (i > 0 && i <= 255) {
                return i
            }
        })

        if (detectPowerup.length > 0) {
            powerUpArray.forEach(e => {
                if (e.hitBoxColour == `rgb(${detectPowerup[0]},${detectPowerup[1]},${detectPowerup[2]})`) {
                    e.die()
                    this.powerupsCollected++
                    score += 10
                    speed -= 1

                }
            })
        }

    },
    fire(time) {
        if (bulletArray.length > 10) return
        if (time - this.timeLastFire < 500) return
        bulletArray.push(new bullet(this.X + 50, this.Y + this.spriteHeight * 0.15, true))
        bulletArray.push(new bullet(this.X + 50, this.Y + this.spriteHeight * 0.85, true))
        this.timeLastFire = time

    },
    speedAdj(value) {
        this.speed += value
        if (this.speed >= 10) this.speed = 10

    }

}

let bulletArray = []
class bullet {
    constructor(x, y, moveX) { // move towards right X++ bool
        this.X = x
        this.Y = y
        this.moveX = moveX
        this.delete = false
        this.speed = 10


    }
    draw() {

        ctx.fillStyle = red
        ctx.fillRect(this.X, this.Y, 40, 3);
        // ctx.beginPath();
        // ctx.arc(this.X, this.Y, 8, 0, 2 * Math.PI, false);
        // ctx.fill();

    }
    update() {


        if (this.X > CANVAS_WIDTH) this.die()
        if (this.X < 0) this.die()

        let detectEnemy = hitBoxCtx.getImageData(this.X, this.Y, 5, 5).data.filter((i) => {
            if (i > 0 && i < 255) {
                return i
            }
        })

        if (detectEnemy.length > 0) {
            enemyArray.forEach(e => {

                if (e.hitBoxColour == `rgb(${detectEnemy[0]},${detectEnemy[1]},${detectEnemy[2]})`) {
                    e.die()
                    this.die()
                    score += 1
                    speed += 0.1
                    player.speedAdj(0.05)
                }
            })
        }

        if (this.moveX == true) this.X += 1 * this.speed
        if (this.moveX == false) this.X -= 1 * this.speed

    }
    die() {
        this.delete = true
    }
}

let enemyArray = []
class enemy {
    constructor(x, y) { // move towards right X++ bool
        this.X = x
        this.Y = y
        this.delete = false
        this.spriteWidth = 110
        this.spriteHeight = 95
        this.speed = speed
        this.hitBoxColour = `rgb(${randomNumber(254)},${randomNumber(254)},${randomNumber(254)})`



    }
    draw() {
        hitBoxCtx.fillStyle = this.hitBoxColour
        hitBoxCtx.fillRect(this.X, this.Y, this.spriteHeight, this.spriteWidth);

    }
    update() {
        this.X -= 1 * this.speed
        if (this.X < 0) endGame = true

    }
    die() {
        explosionArray.push(new explosion(this.X, this.Y))
        // if (randomNumber(100) < 5) powerUpArray.push(new powerUp(this.X, this.Y))
        this.delete = true
    }
}


const enemy1 = new Image()
enemy1.src = './enemy/enemy1.png'
class enemyShip extends enemy {
    constructor(x, y) {
        super(x, y);
        this.frame = false
        this.frameDelay = 10

    }
    draw() {
        ctx.drawImage(enemy1, this.spriteWidth * this.frame, 0, 110, 95, this.X, this.Y, this.spriteWidth, this.spriteHeight);
        hitBoxCtx.fillStyle = this.hitBoxColour
        hitBoxCtx.fillRect(this.X, this.Y, this.spriteWidth, this.spriteHeight);
    }

    update() {
        this.frameDelay--
        if (this.frameDelay == 0) {
            this.frame = !this.frame
            this.frameDelay = randomNumber(100)
        }

        const random = randomNumber(100)
        // if (random < 10) this.Y++
        // if (random > 10) this.Y--
        // if (random < 10) this.Y+=10
        // if (random > 10) this.Y-=10

        this.X -= 1 * this.speed
        if (this.X < 0) endGame = true
    }

}

const alien1 = new Image()
alien1.src = './enemy/enemy2.png'
class alien extends enemy {
    constructor(x, y){
        super(x,y)
    }
    draw(){
        ctx.drawImage(alien1, 0, 0, 322, 340, this.X, this.Y, this.spriteWidth, this.spriteHeight);
        hitBoxCtx.fillStyle = this.hitBoxColour
        hitBoxCtx.fillRect(this.X, this.Y, this.spriteWidth, this.spriteHeight);
    }
}


let powerUpArray = []
const powerup1 = new Image()
powerup1.src = './powerup/speed.png'
class powerUp {
    constructor(x, y) {
        this.X = x
        this.Y = y
        this.spriteWidth = 60
        this.spriteHeight = 50
        this.speed = speed
        this.delete = false
        this.hitBoxColour = `rgb(${randomNumber(254)},${randomNumber(254)},${randomNumber(254)})`
    }
    draw() {
        ctx.drawImage(powerup1, 0, 0, 50, 50, this.X, this.Y, this.spriteWidth, this.spriteHeight)
        // ctx.fillStyle = red
        // ctx.fillRect(this.X, this.Y, this.spriteWidth, this.spriteHeight);
        hitBoxCtx.fillStyle = this.hitBoxColour
        hitBoxCtx.fillRect(this.X, this.Y, this.spriteHeight, this.spriteWidth);
    }
    update() {
        this.X -= 1 * this.speed
    }
    die() {
        this.delete = true
    }
}



const explosionImg = new Image();
explosionImg.src = './exp.png'
explosionArray = []
class explosion {
    constructor(x, y, spriteWidth = 100, spriteHeight = 100) {
        this.X = x
        this.Y = y
        this.delete = false
        this.spriteWidth = spriteWidth
        this.spriteHeight = spriteHeight
        this.frameWidth = 64
        this.frameHeight = 64
        this.framePosX = 0
        this.framePosY = 0
        this.anamateDelay = 4


    }
    draw() {
        ctx.drawImage(explosionImg, this.framePosX, this.framePosY, this.frameWidth, this.frameHeight, this.X, this.Y, this.spriteWidth, this.spriteHeight);

    }
    update() {
        if (this.anamateDelay == 0) {
            this.framePosX += this.frameWidth
            this.anamateDelay = 4
        }
        this.anamateDelay--
        if (this.framePosX == 320) {
            this.framePosX = 0
            this.framePosY += this.frameHeight
        }
        if (this.framePosY == 320) this.die()
        // this.framePosY+= this.frameHeight


    }
    die() {
        this.delete = true
    }
}
let starArray = []
class star {
    constructor(x, y) {
        this.X = x
        this.Y = y
        this.radius = 2
        this.speed = randomNumber(10)
        this.delete = false
    }
    draw() {
        ctx.fillStyle = white
        ctx.beginPath();
        ctx.arc(this.X, this.Y, this.radius, 0, 2 * Math.PI, false);
        ctx.fill();
    }
    update() {
        if (this.X < 0) this.die()
        this.X -= 1 * this.speed

    }
    die() {
        this.delete = true

    }

}



function anamate(time) {
    if (timeLastFrame == null) {
        timeLastFrame = time
        requestAnimationFrame(anamate)
    }

    if(speed < 1) speed = 1

    const delta = time - timeLastFrame
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    hitBoxCtx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);


    if(score > 20 && score < 22){
        stopEnemySpawn()
        startEnemySpawn(100)
    }

    [...starArray, ...enemyArray, ...bulletArray, ...explosionArray, ...powerUpArray].forEach((b) => {
        b.update()
        b.draw()
    });
    player.draw();
    player.update(time);
    bulletArray = bulletArray.filter(e => !e.delete)
    enemyArray = enemyArray.filter(e => !e.delete)
    explosionArray = explosionArray.filter(e => !e.delete)
    powerUpArray = powerUpArray.filter(e => !e.delete)
    starArray = starArray.filter(e => !e.delete)

    scoreElement.innerText = score

    timeLastFrame = time
    if (endGame == false) {
        requestAnimationFrame(anamate)
    } else {
        showEndScreen()
    }
}

function randomNumber(number) {
    return Math.floor(Math.random() * number) + 1;
}

canvas.addEventListener('mousemove', e => {
    player.X = e.x + player.spriteWidth /2
    player.Y = e.y - player.spriteHeight /2 

})
canvas.addEventListener('click', e => {
    player.fire()
})
document.addEventListener('keydown', (e) => {
    if (e.code === 'KeyW') player.up = true
    if (e.code === 'KeyA') player.left = true
    if (e.code === 'KeyS') player.down = true
    if (e.code === 'KeyD') player.right = true
    if (e.code === 'KeyM') player.shoot = true
    if (e.code === 'KeyM') player.fire()
})

document.addEventListener('keyup', (e) => {
    if (e.code === 'KeyW') player.up = false
    if (e.code === 'KeyA') player.left = false
    if (e.code === 'KeyS') player.down = false
    if (e.code === 'KeyD') player.right = false
    if (e.code === 'KeyM') player.shoot = false
})


async function getImage() {
    const startScreenBackground = await fetch("https://api.nasa.gov/planetary/apod?api_key=73Tu2lOwe7jkPXWknJBeXtpZ6hO2OMr7G1Kckzhc&count=2")
    const startScreenBackgroundData = await startScreenBackground.json()
    nasaOverlay.style.backgroundImage = `url('${startScreenBackgroundData[1].url}') `
    startScreen.style.backgroundImage = `url('${startScreenBackgroundData[0].url}') `
    startScreen.style.backgroundSize = "cover"
}
function startGame() {
    startScreen.style.display = 'none'
    startEnemySpawn(500)
    fadeOutNasa()
    setInterval(() => {
        starArray.push(new star(CANVAS_WIDTH, randomNumber(CANVAS_HEIGHT)))
    }, 100 * speed);
    anamate(0)

}
const sleep = (time) => {
    return new Promise((resolve) => {
        return setTimeout(function () {
            resolve()
        }, time)
    })
}
async function fadeOutNasa() {
    for (let i = 100; i > 20; i--) {
        nasaOverlay.style.opacity = i / 100
        await sleep(30)
    }
}

function startEnemySpawn(time) {
    enemySpawnId = setInterval(() => {
        enemyArray.push(new enemyShip(CANVAS_WIDTH, randomNumber(CANVAS_HEIGHT - 50)))
    }, speed * time);

    enemySpawnId2 = setInterval(() => {
        enemyArray.push(new alien(CANVAS_WIDTH, randomNumber(CANVAS_HEIGHT - 50)))
    }, time * 4 * speed );
}
function stopEnemySpawn() {
    clearInterval(enemySpawnId)
    clearInterval(enemySpawnId2)

}

function showEndScreen() {
    nasaOverlay.style.opacity = 1
    startScreen.style.display = 'flex'
    startScreen.children[0].innerText = "Your score"
    startScreen.children[2].innerText = score
    stopEnemySpawn()
    enemyArray = []
    speed = 1
    endGame = false
    score = 0
}