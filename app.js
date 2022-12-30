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
        this.color = 'yellow'
    }
    render() {
        ctx.fillStyle = this.color
        this.y -= this.speed
        ctx.fillRect(this.x, this.y, this.width, this.height)
    }
    collideWith(sprite) {
        if (
            this.x < sprite.x + sprite.width &&
            this.x + this.width > sprite.x &&
            this.y < sprite.y + sprite.height &&
            this.y + this.height > sprite.y
        ) {
            sprite.takeDamage(this.damage)
            return true
        }
        return false
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
    collideWith(sprite) {
        return this.projectiles.some((projectile) => {
            if (projectile.collideWith(sprite)) {
                this.projectiles.splice(this.projectiles.indexOf(projectile), 1)
                return true
            }
            return false
        })
    }
}

const getRandomCoordinates = (max) => {
    return Math.floor((Math.random() * max) + 50)
}

class Obstacle {
    constructor() {
        this.x = getRandomCoordinates(canvas.width - 60)
        this.y = getRandomCoordinates(canvas.height / 2 + 50)
        this.width = 9
        this.height = 9
        this.color = 'pink'
        this.alive = true
        this.health = 3
    }
    render() {
        if (this.health === 3) {
            ctx.fillStyle = this.color
            ctx.fillRect(this.x, this.y, this.width, this.height)
        } else if (this.health === 2) {
            ctx.fillStyle = 'red'
            ctx.fillRect(this.x, this.y, this.width, this.height - 3)
        } else if (this.health === 1) {
            ctx.fillStyle = 'purple'
            ctx.fillRect(this.x, this.y, this.width, this.height - 6)
        }
    }
    takeDamage(damage) {
        this.health -= damage
    }
}

const levelOneObstacles = [
    new Obstacle(),
    new Obstacle(),
    new Obstacle(),
    new Obstacle(),
    new Obstacle(),
    new Obstacle(),
    new Obstacle(),
    new Obstacle(),
    new Obstacle(),
    new Obstacle(),
    new Obstacle(),
    new Obstacle(),
    new Obstacle(),
    new Obstacle(),
    new Obstacle(),
    new Obstacle(),
    new Obstacle(),
    new Obstacle(),
    new Obstacle(),
    new Obstacle(),
    new Obstacle()
]

const projectileController = new ProjectileController()
const player = new Player(371, 468, 20, 20, 'rgb(7,68,252)', projectileController)



// const detectHit = (obstacle) => {
//     if (projectileController.projectiles.projectile.x < obstacle.x + obstacle.width
//         && projectileController.projectiles.projectile.x + projectileController.projectiles.projectile.width > obstacle.x
//         && projectileController.projectiles.projectile.y < obstacle.y + obstacle.height
//         && projectileController.projectiles.projectile.y + projectileController.projectiles.projectile.height > obstacle.y) {
//             obstacle.alive = false
//         }
// }

const gameLoop = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    projectileController.render()
    player.render()
    player.movePlayer()
    levelOneObstacles.forEach((obstacle) => {
        if (projectileController.collideWith(obstacle)) {
            if (obstacle.health <= 0) {
                const index = levelOneObstacles.indexOf(obstacle)
                levelOneObstacles.splice(index, 1)
            }
        } else {
            obstacle.render()
        }
})
}


document.addEventListener('keydown', (e) => {
    player.setDirection(e.key)
})

document.addEventListener('keyup', (e) => {
    if (['w', 'a', 's', 'd', ' '].includes(e.key)) {
        player.unSetDirection(e.key)
    }
})

document.addEventListener('click', (e) => {
    console.log(`x: ${e.offsetX} y: ${e.offsetY}`)
})

const gameInterval = setInterval(gameLoop, 60)

const stopGameLoop = () => { clearInterval(gameInterval) }

document.addEventListener('DOMContentLoaded', function () {
    gameInterval
})

