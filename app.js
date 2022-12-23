const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

canvas.setAttribute('width', getComputedStyle(canvas)['width'])
canvas.setAttribute('height', getComputedStyle(canvas)['height'])

class Player {
    constructor(x, y, width, height, color) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.color = color
        this.alive = true
        this.speed = 15
        this.direction = {
            up: false,
            down: false,
            left: false,
            right: false
        }
        this.render = function () {
            ctx.fillStyle = this.color
            ctx.fillRect(this.x, this.y, this.width, this.height)
        }
        this.setDirection = function (key) {
            if(key.toLowerCase() == 'w') { this.direction.up = true }
            if(key.toLowerCase() == 'a') { this.direction.left = true }
            if(key.toLowerCase() == 's') { this.direction.down = true }
            if(key.toLowerCase() == 'd') { this.direction.right = true }
        }
        this.unSetDirection = function (key) {
            if(key.toLowerCase() == 'w') { this.direction.up = false }
            if(key.toLowerCase() == 'a') { this.direction.left = false }
            if(key.toLowerCase() == 's') { this.direction.down = false }
            if(key.toLowerCase() == 'd') { this.direction.right = false }
        }
        this.movePlayer = function () {
            if (this.direction.up) {
                this.y -= this.speed
                if (this.y <= 0) { this.y = 0 }
            }
            if (this.direction.left) {
                this.x -= this.speed
                if (this.x <= 0) { this.x = 0 }
            }
            if (this.direction.down) {
                this.y += this.speed
                if(this.y + this.height >= canvas.height) { this.y = canvas.height - this.height }
            }
            if (this.direction.right) {
                this.x += this.speed
                if(this.x + this.width >= canvas.width) { this.x = canvas.width -this.width }
            }
        }
        
    }
}

class Projectile {
    constructor(x, y, width, height, color) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.color = color
        this.alive = true
        this.speed = 20
        this.direction = { up: false }
        this.renderProjectile = function () {
            ctx.beginPath()
            ctx.moveTo((player.x + 10), (player.y - 5))
            ctx.lineTo((player.x + 10), (player.y - 15))
            ctx.lineWidth = 2
            ctx.strokeStyle = color
            ctx.stroke()
        }
        this.shoot = function (key) {
            if (key == ' ') {
                this.direction.up = true
                console.log(this)
                player.y -= this.speed
            }
        }
    }
}

const player = new Player(10, 10, 20, 20, 'rgb(7,68,252)')
const projectile = new Projectile((player.x + 10), (player.y - 5), (player.x + 10), (player.y - 15), 'rgba(252,191,7,1)')

const gameLoop = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    player.render()
    projectile.renderProjectile()
    player.movePlayer()
    projectile.shoot()
}

document.addEventListener('keydown', (e) => {
    projectile.shoot(e.key)
    player.setDirection(e.key)
})

document.addEventListener('keyup', (e) => {
    if (['w', 'a', 's', 'd'].includes(e.key)) {
        player.unSetDirection(e.key)
    }
})

const gameInterval = setInterval(gameLoop, 60)

const stopGameLoop = () => { clearInterval(gameInterval) }

document.addEventListener('DOMContentLoaded', function () {
    gameInterval
})

