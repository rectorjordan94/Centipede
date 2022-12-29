const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

canvas.setAttribute('width', getComputedStyle(canvas)['width'])
canvas.setAttribute('height', getComputedStyle(canvas)['height'])

class Player {
    constructor(x, y, width, height, color, projectileController) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.color = color
        this.projectileController = projectileController
        this.alive = true
        this.speed = 15
        this.shootPressed = false
        this.direction = {
            up: false,
            down: false,
            left: false,
            right: false
        }
        this.render = function () {
            ctx.fillStyle = this.color
            ctx.fillRect(this.x, this.y, this.width, this.height)

            this.shoot()
            
        }
        this.setDirection = function (key) {
            if(key.toLowerCase() == 'w') { this.direction.up = true }
            if(key.toLowerCase() == 'a') { this.direction.left = true }
            if(key.toLowerCase() == 's') { this.direction.down = true }
            if (key.toLowerCase() == 'd') { this.direction.right = true }
            if(key == ' ') { this.shootPressed = true}
        }
        this.unSetDirection = function (key) {
            if(key.toLowerCase() == 'w') { this.direction.up = false }
            if(key.toLowerCase() == 'a') { this.direction.left = false }
            if(key.toLowerCase() == 's') { this.direction.down = false }
            if (key.toLowerCase() == 'd') { this.direction.right = false }
            if(key == ' ') { this.shootPressed = false}
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
        this.shoot = function () {
            if (this.shootPressed) {
                console.log('shoot')
                const speed = 20
                const delay = 4
                const damage = 1
                const projectileX = this.x + this.width / 2
                const projectileY = this.y
                this.projectileController.shoot(projectileX, projectileY, speed, damage, delay)
            }
        }
        
    }
}

class Projectile {
    constructor(x, y, speed, damage) {
        this.x = x
        this.y = y
        this.speed = speed
        this.damage = damage
        this.width = 5
        this.height = 10
        this.color = 'red'
    }
    render() {
        ctx.fillStyle = this.color
        this.y -= this.speed
        ctx.fillRect(this.x, this.y, this.width, this.height)
    }

}

class ProjectileController {
    projectiles = []
    timeTillNextProjectile = 0
    constructor(canvas) {
        this.canvas = canvas
    }
    shoot(x, y, speed, damage, delay) { 
        if (this.timeTillNextProjectile <= 0) {
            this.projectiles.push(new Projectile(x, y, speed, damage))
            this.timeTillNextProjectile = delay
        }

        this.timeTillNextProjectile--
    }
    render() {
        this.projectiles.forEach((projectile) => {
            if (this.isProjectileOffScreen(projectile)) {
                const index = this.projectiles.indexOf(projectile)
                this.projectiles.splice(index, 1)
            }
            projectile.render()
        })
    }
    isProjectileOffScreen(projectile) {
        return projectile.y <= -projectile.height
    }
}

const projectileController = new ProjectileController()
const player = new Player(10, 10, 20, 20, 'rgb(7,68,252)', projectileController)
// let x = player.x
// let y = player.y
// let dy = -30

// function drawProjectile() {
//     ctx.beginPath()
//     ctx.fillRect(x, y, 10, 10)
//     ctx.fillStyle = 'rgb(7,69,252)'
//     ctx.closePath()
// }


// const projectile = new Projectile(19, 10, 2, 10, 'rgba(252,191,7,1)')

// const shoot = () => {
//     drawProjectile()
//     y -= dy
// }

const gameLoop = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    projectileController.render()
    player.render()
    player.movePlayer()
    // console.log(player.shootPressed)
    // shoot()
    // console.log(player.x, player.y)
    // if (projectile.alive) {
    //     projectile.renderProjectile()
    //     // projectile.moveProjectile()
    // }
    // drawProjectile()
    // y -= dy
}

document.addEventListener('keydown', (e) => {
    player.setDirection(e.key)
})

document.addEventListener('keyup', (e) => {
    if (['w', 'a', 's', 'd', ' '].includes(e.key)) {
        player.unSetDirection(e.key)
    }
})

const gameInterval = setInterval(gameLoop, 60)

const stopGameLoop = () => { clearInterval(gameInterval) }

document.addEventListener('DOMContentLoaded', function () {
    gameInterval
})

