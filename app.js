const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
const scoreDisplay = document.getElementById('score')
const livesDisplay = document.getElementById('lives')


canvas.setAttribute('width', getComputedStyle(canvas)['width'])
canvas.setAttribute('height', getComputedStyle(canvas)['height'])

let level = 1

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
                const speed = 15
                const delay = 5
                const damage = 1
                const projectileX = this.x + this.width / 2.5
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
        this.width = 3
        this.height = 10
        this.color = 'yellow'
    }
    render() {
        // render and initiate movement of projectiles
        ctx.fillStyle = this.color
        this.y -= this.speed
        ctx.fillRect(this.x, this.y, this.width, this.height)
    }
    collideWith(sprite) {
        // detect collision with obstacles in environment or centipede segments
        if (
            this.x < (sprite.x + sprite.width || sprite.x + sprite.radius) &&
            this.x + this.width > (sprite.x || sprite.x - sprite.radius) &&
            this.y < (sprite.y + sprite.height || sprite.y + sprite.radius) &&
            this.y + this.height > (sprite.y || sprite.y - sprite.radius)
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
        // if there is no time till next projectile, fire one
        if (this.timeTillNextProjectile <= 0) {
            this.projectiles.push(new Projectile(x, y, speed, damage))
            // set time till next projectile equal to the delay
            this.timeTillNextProjectile = delay
        }
        // decrement time till next projectile
        this.timeTillNextProjectile--
    }
    render() {
        // for each projectile in the array of projectiles, detect if the projectile is off screen and if so remove it from the array of projectiles
        this.projectiles.forEach((projectile) => {
            if (this.isProjectileOffScreen(projectile)) {
                const index = this.projectiles.indexOf(projectile)
                this.projectiles.splice(index, 1)
            }
            // otherwise, if projectile is currently on screen, render it
            projectile.render()
        })
    }
    isProjectileOffScreen(projectile) {
        // detects if projectile is off screen
        return projectile.y <= -projectile.height
    }
    collideWith(sprite) {
        // if any of the projectiles collide with a sprite (either an obstacle or a segment of the centipede) remove it from the array of projectiles and return true
        return this.projectiles.some((projectile) => {
            if (projectile.collideWith(sprite)) {
                this.projectiles.splice(this.projectiles.indexOf(projectile), 1)
                return true
            }
            return false
        })
    }
}

const centipede = []

class CentipedeSegment {
    constructor(x, y) {
        this.x = x
        this.y = y
        this.speed = 5
        this.radius = 8
        this.color = 'green'
        this.health = 1
        this.direction = {
            down: false,
            left: false,
            // centipede always moves to the right by default
            right: true
        }
    }
    render() {
        if (this.health === 1) {
            ctx.beginPath()
            ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI)
            if (level === 1) {
                ctx.fillStyle = this.color
            } else if (level === 2) {
                ctx.fillStyle = 'red'
            } else if (level === 3) {
                ctx.fillStyle = 'orange'
            }
            ctx.fill()
        } 
    }
    move() {
        if (this.direction.right === true) {
            this.x += this.speed
            if (this.x + this.radius >= canvas.width - 16) {
                // if the right edge of a centipede segment touches the edge of the canvas, stop moving right and start moving downwards
                this.direction.right = false
                this.direction.down = true
            }
        }
        if (this.direction.left === true) {
            this.x -= this.speed
            if (this.x - this.radius <= 0) {
                // if the left edge of a centipede segment touches the left edge of the canvas, stop moving left and start moving downwards
                this.direction.left = false
                this.direction.down = true
            }
        }
        if (this.direction.down === true) {
            this.y += 16
            if (this.x > 350) {
                this.direction.left = true
            } else if (this.x < 350) {
                this.direction.right = true
            }
            this.direction.down = false
        }
    }
    takeDamage(damage) {
        this.health -= damage
    }
}

// class CentipedeBody {
//     segmentArray = [
//         new CentipedeSegment(100,100),
//         new CentipedeSegment(116,100),
//         new CentipedeSegment(132,100),
//     ]
//     render() {
//         this.segmentArray.forEach((segment) => segment.render())
//     }
//     moveBody() {
//         this.segmentArray.forEach((segment) => segment.move())
//     }
// }

const getRandomCoordinates = (max) => {
    return Math.floor((Math.random() * max) + 16)
}

const obstacles = []

class Obstacle {
    constructor(x, y) {
        this.x = x
        this.y = y
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

const obstacleSpawner = () => {
    for (let i = 0; i < 20; i++){
        obstacles.push(new Obstacle(getRandomCoordinates(canvas.width - 100), getRandomCoordinates(canvas.height / 2 + 100)))
    }
}

obstacleSpawner()

let centipedeX = 50
let centipedeY = 50
let centipedeLength = 5
const centipedeSpawner = () => {
    for (let i = 0; i < centipedeLength; i++){
        centipede.push(new CentipedeSegment(centipedeX + 16*i, centipedeY))
    }
    // centipede.push(new CentipedeSegment(centipedeX,100))  
    // centipede.push(new CentipedeSegment(centipedeX + 16,100))  
    // centipede.push(new CentipedeSegment(centipedeX + 16*2,100))  
    // centipede.push(new CentipedeSegment(centipedeX + 16*3,100))  
    // centipede.push(new CentipedeSegment(centipedeX + 16*4,100))  
}

centipedeSpawner()

// const levelOneObstacles = [
//     new Obstacle(),
//     new Obstacle(),
//     new Obstacle(),
//     new Obstacle(),
//     new Obstacle(),
//     new Obstacle(),
//     new Obstacle(),
//     new Obstacle(),
//     new Obstacle(),
//     new Obstacle(),
//     new Obstacle(),
//     new Obstacle(),
//     new Obstacle(),
//     new Obstacle(),
//     new Obstacle(),
//     new Obstacle(),
//     new Obstacle(),
//     new Obstacle(),
//     new Obstacle(),
//     new Obstacle(),
//     new Obstacle()
// ]

// const levelOneCentipede = [
//     new CentipedeSegment(100,100),
//     new CentipedeSegment(116,100),
//     new CentipedeSegment(132,100)
// ]

const projectileController = new ProjectileController()
const player = new Player(371, 468, 20, 20, 'rgb(7,68,252)', projectileController)
// const centipede = new CentipedeBody()

let score = 0
const detectHit = () => {
    obstacles.forEach((obstacle) => {
        if (projectileController.collideWith(obstacle)) {
            score += 5
            scoreDisplay.textContent = `Score: ${score}`
            if (obstacle.health <= 0) {
                const index = obstacles.indexOf(obstacle)
                obstacles.splice(index, 1)
            }
        } else {
            obstacle.render()
        }
    })
    centipede.forEach((segment) => {
        if (projectileController.collideWith(segment)) {
            score += 100
            scoreDisplay.textContent = `Score: ${score}`
            if (segment.health <= 0) {
                const index = centipede.indexOf(segment)
                centipede.splice(index, 1)
            }
        } else {
            segment.render()
            segment.move()
        }
    })
}

const levelUp = () => {
    if (centipede.length === 0) {
        score += 1000
        scoreDisplay.textContent = `Score: ${score}`
        level++
        centipedeLength++
        centipede.length = 0
        obstacles.length = 0
        centipedeSpawner()
        obstacleSpawner()
    }
}

const gameLoop = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    projectileController.render()
    player.render()
    player.movePlayer()
    detectHit()
    levelUp()
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

const gameInterval = setInterval(gameLoop, 30)

const stopGameLoop = () => { clearInterval(gameInterval) }

document.addEventListener('DOMContentLoaded', function () {
    gameInterval
})

