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

class Obstacle {
    constructor() {
        this.x = getRandomCoordinates(canvas.width)
        this.y = getRandomCoordinates(canvas.height)
        this.width = 15
        this.height = 15
        this.color = 'pink'
        this.alive = true
        this.health = 3
    }
    render() {
        ctx.fillStyle = this.color
        ctx.fillRect(this.x, this.y, this.width, this.height)
    }
}

const obstacles = []
let beginLevelOne = true


const getRandomCoordinates = (max) => {
    return Math.floor(Math.random() * max)
}

const projectileController = new ProjectileController()
const player = new Player(10, 10, 20, 20, 'rgb(7,68,252)', projectileController)

const spawnObstacles = () => {
    for (let i = 0; i < 10; i++){
        const obstacle = new Obstacle()
        obstacles.push(obstacle)
    }
}

spawnObstacles()
console.log(obstacles)

const gameLoop = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    projectileController.render()
    // obstacleSpawner.render()
    // obstacles.render()
    player.render()
    player.movePlayer()
    for (let i = 0; i < 10; i++) {
        obstacles[i].render()
    }
    
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

