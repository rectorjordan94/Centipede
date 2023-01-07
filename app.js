const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
const scoreDisplay = document.getElementById('score')
const livesDisplay = document.getElementById('lives')
const startButton = document.getElementById('start-button')
const upButton = document.getElementById('up-button')
const rightButton = document.getElementById('right-button')
const downButton = document.getElementById('down-button')
const leftButton = document.getElementById('left-button')
const shootButton = document.getElementById('shoot-button')
const modal = document.getElementById('modal')
const spaceship = document.getElementById('spaceship')
const projectile = document.getElementById('projectile')
const obstacleSprites = document.getElementById('obstacle-sprites')
const centipedeSprites = document.getElementById('centipede-sprites')
const nameInput = document.getElementById('name-input')
const scoreModal = document.getElementById('score-modal')
const highScore = document.getElementById('high-score')

spaceship.src = 'images/Spaceship-2-1.png (2).png'
projectile.src = 'images/Projectile-1.png (1).png'
obstacleSprites.src = 'images/Obstacle_Sprite_Sheet-1.png.png'
centipedeSprites.src ='images/Centipede_Sprite_Sheet-1.png.png'

canvas.setAttribute('width', '700px')
canvas.setAttribute('height', '430px')

let level = 1
const centipede = []
const obstacles = []
let score = 0
let lives = 3

const getRandomCoordinates = (max) => {
    return Math.floor((Math.random() * max) + 16)
}


/// CLASSES ///
class Player {
    constructor(x, y, width, height, color, projectileController) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.color = color
        this.projectileController = projectileController
        this.alive = true
        this.speed = 5
        this.shootPressed = false
        this.direction = {
            up: false,
            down: false,
            left: false,
            right: false
        }
        this.render = function () {
            // draws hitbox on canvas
            ctx.fillRect(this.x, this.y, this.width, this.height)
            // draws sprite on canvas
            ctx.drawImage(spaceship, this.x, this.y)
            this.shoot()
        }
        this.setDirection = function (key) {
            // initiates player movement based on key down even for the corresponding keys
            if(key.toLowerCase() == 'w') { this.direction.up = true }
            if(key.toLowerCase() == 'a') { this.direction.left = true }
            if(key.toLowerCase() == 's') { this.direction.down = true }
            if (key.toLowerCase() == 'd') { this.direction.right = true }
            // shoots a projectile if space is pressed
            if(key == ' ') { this.shootPressed = true}
        }
        this.unSetDirection = function (key) {
            // stops player movement for key up event
            if(key.toLowerCase() == 'w') { this.direction.up = false }
            if(key.toLowerCase() == 'a') { this.direction.left = false }
            if(key.toLowerCase() == 's') { this.direction.down = false }
            if (key.toLowerCase() == 'd') { this.direction.right = false }
            // when space is released, stops shooting projectiles
            if(key == ' ') { this.shootPressed = false}
        }
        this.movePlayer = function () {
            if (this.direction.up) {
                this.y -= this.speed
                // prevents player from moving into the field of obstacles
                if (this.y <= 330) { this.y = 330 }
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
                // if space is pressed, begins shooting projectiles from the center of the player, with a small delay in between each projectile if space is continually held
                const speed = 4
                const delay = 10
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
        this.width = 5
        this.height = 10
        this.color = 'yellow'
    }
    render() {
        // render and initiate movement of projectiles
        this.y -= this.speed
        // draws hitbox on canvas
        ctx.fillRect(this.x, this.y, this.width, this.height)
        // draws sprite on canvas
        ctx.drawImage(projectile, this.x, this.y)
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

class CentipedeSegment {
    constructor(x, y) {
        this.x = x
        this.y = y
        this.speed = 2
        this.radius = 8
        this.health = 1
        this.direction = {
            down: false,
            left: false,
            // centipede always moves to the right by default
            right: true
        }
    }
    render() {
        ctx.beginPath()
        // draws hitbox on canvas
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI)
        // determine what level the user is on and which direction the centipede is currently facing to render the appropriate sprites
        // could possibly refactor this later, maybe by creating an array of levels and determining if the current level is present in the array
        if (level === 1 || level === 7 || level === 13 || level === 19) {
            if (this.direction.right === true) {
                ctx.drawImage(centipedeSprites, 0, 0, 16, 16, this.x, this.y, 16, 16)
            } else if (this.direction.left === true) {
                ctx.drawImage(centipedeSprites, 16, 0, 16, 16, this.x, this.y, 16, 16)
            } else if (this.direction.down === true) {
                ctx.drawImage(centipedeSprites, 32, 0, 16, 16, this.x, this.y, 16, 16)
            }
        } else if (level === 2 || level === 8 || level === 14 || level === 20) {
            if (this.direction.right === true) {
                ctx.drawImage(centipedeSprites, 0, 16, 16, 16, this.x, this.y, 16, 16)
            } else if (this.direction.left === true) {
                ctx.drawImage(centipedeSprites, 16, 16, 16, 16, this.x, this.y, 16, 16)
            } else if (this.direction.down === true) {
                ctx.drawImage(centipedeSprites, 32, 16, 16, 16, this.x, this.y, 16, 16)
            }
        } else if (level === 3 || level === 9 || level === 15 || level === 21) {
            if (this.direction.right === true) {
                ctx.drawImage(centipedeSprites, 0, 32, 16, 16, this.x, this.y, 16, 16)
            } else if (this.direction.left === true) {
                ctx.drawImage(centipedeSprites, 16, 32, 16, 16, this.x, this.y, 16, 16)
            } else if (this.direction.down === true) {
                ctx.drawImage(centipedeSprites, 32, 32, 16, 16, this.x, this.y, 16, 16)
            }
        } else if (level === 4 || level === 10 || level === 16 || level === 22) {
            if (this.direction.right === true) {
                ctx.drawImage(centipedeSprites, 0, 48, 16, 16, this.x, this.y, 16, 16)
            } else if (this.direction.left === true) {
                ctx.drawImage(centipedeSprites, 16, 48, 16, 16, this.x, this.y, 16, 16)
            } else if (this.direction.down === true) {
                ctx.drawImage(centipedeSprites, 32, 48, 16, 16, this.x, this.y, 16, 16)
            }
        } else if (level === 5 || level === 11 || level === 17 || level === 23) {
            if (this.direction.right === true) {
                ctx.drawImage(centipedeSprites, 0, 64, 16, 16, this.x, this.y, 16, 16)
            } else if (this.direction.left === true) {
                ctx.drawImage(centipedeSprites, 16, 64, 16, 16, this.x, this.y, 16, 16)
            } else if (this.direction.down === true) {
                ctx.drawImage(centipedeSprites, 32, 64, 16, 16, this.x, this.y, 16, 16)
            }
        } else if (level === 6 || level === 12 || level === 18 || level === 24) {
            if (this.direction.right === true) {
                ctx.drawImage(centipedeSprites, 0, 80, 16, 16, this.x, this.y, 16, 16)
            } else if (this.direction.left === true) {
                ctx.drawImage(centipedeSprites, 16, 80, 16, 16, this.x, this.y, 16, 16)
            } else if (this.direction.down === true) {
                ctx.drawImage(centipedeSprites, 32, 80, 16, 16, this.x, this.y, 16, 16)
            }
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
            this.y += 17
            if (this.x >= 350) {
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
    collideWith(sprite) {
        // detect collision with obstacles in environment or edges of canvas
        if (
            this.x - this.radius < sprite.x + sprite.width &&
            this.x + this.radius > sprite.x &&
            this.y - this.radius < sprite.y + sprite.height &&
            this.y + this.radius > sprite.y
        ) {
            return true
        }
        return false
    }
}

class Obstacle {
    constructor(x, y) {
        this.x = x
        this.y = y
        this.width = 12
        this.height = 12
        this.alive = true
        this.health = 3
    }
    render() {
        ctx.beginPath()
        // draws hitbox on canvas
        ctx.fillRect(this.x, this.y, this.width, this.height)
        // determines level and health of individual obstacles and displays the appropriate sprite
        if (level === 1 || level === 7 || level === 13 || level === 19) {
            if (this.health === 3) {
                ctx.drawImage(obstacleSprites, 0, 0, 12, 12, this.x, this.y, this.width, this.height)
            } else if (this.health === 2) {
                ctx.drawImage(obstacleSprites, 12, 0, 12, 12, this.x, this.y, this.width, this.height)
            } else if (this.health === 1) {
                ctx.drawImage(obstacleSprites, 24, 0, 12, 12, this.x, this.y, this.width, this.height)
            }
        } else if (level === 2 || level === 8 || level === 14 || level === 20) {
            if (this.health === 3) {
                ctx.drawImage(obstacleSprites, 0, 12, 12, 12, this.x, this.y, this.width, this.height)
            } else if (this.health === 2) {
                ctx.drawImage(obstacleSprites, 12, 12, 12, 12, this.x, this.y, this.width, this.height)
            } else if (this.health === 1) {
                ctx.drawImage(obstacleSprites, 24, 12, 12, 12, this.x, this.y, this.width, this.height)
            }
        } else if (level === 3 || level === 9 || level === 15 || level === 21) {
            if (this.health === 3) {
                ctx.drawImage(obstacleSprites, 0, 24, 12, 12, this.x, this.y, this.width, this.height)
            } else if (this.health === 2) {
                ctx.drawImage(obstacleSprites, 12, 24, 12, 12, this.x, this.y, this.width, this.height)
            } else if (this.health === 1) {
                ctx.drawImage(obstacleSprites, 24, 24, 12, 12, this.x, this.y, this.width, this.height)
            }
        } else if (level === 4 || level === 10 || level === 16 || level === 22) {
            if (this.health === 3) {
                ctx.drawImage(obstacleSprites, 0, 36, 12, 12, this.x, this.y, this.width, this.height)
            } else if (this.health === 2) {
                ctx.drawImage(obstacleSprites, 12, 36, 12, 12, this.x, this.y, this.width, this.height)
            } else if (this.health === 1) {
                ctx.drawImage(obstacleSprites, 24, 36, 12, 12, this.x, this.y, this.width, this.height)
            }
        } else if (level === 5 || level === 11 || level === 17 || level === 23) {
            if (this.health === 3) {
                ctx.drawImage(obstacleSprites, 0, 48, 12, 12, this.x, this.y, this.width, this.height)
            } else if (this.health === 2) {
                ctx.drawImage(obstacleSprites, 12, 48, 12, 12, this.x, this.y, this.width, this.height)
            } else if (this.health === 1) {
                ctx.drawImage(obstacleSprites, 24, 48, 12, 12, this.x, this.y, this.width, this.height)
            }
        } else if (level === 6 || level === 12 || level === 18 || level === 24) {
            if (this.health === 3) {
                ctx.drawImage(obstacleSprites, 0, 60, 12, 12, this.x, this.y, this.width, this.height)
            } else if (this.health === 2) {
                ctx.drawImage(obstacleSprites, 12, 60, 12, 12, this.x, this.y, this.width, this.height)
            } else if (this.health === 1) {
                ctx.drawImage(obstacleSprites, 24, 60, 12, 12, this.x, this.y, this.width, this.height)
            }
        }
    }
    takeDamage(damage) {
        this.health -= damage
    }
}

let obstacleLength = 10

const obstacleSpawner = () => {
    // spawns an array of obstacles at random coordinates, with constraints so they don't spawn to close to the edges or in the player area
    for (let i = 0; i < obstacleLength; i++){
        obstacles.push(new Obstacle(getRandomCoordinates(canvas.width - 100), getRandomCoordinates(canvas.height / 2 + 100)))
    }
}
// initializes the array of obstacles
obstacleSpawner()
// determines centipede start position and initializes the centipede with only 5 segments
let centipedeX = getRandomCoordinates(400)
let centipedeY = getRandomCoordinates(25)
let centipedeLength = 5

const centipedeSpawner = () => {
    // spawns the centipede array, with each incremented segment of the array beginning at the end of the previous segment
    for (let i = 0; i < centipedeLength; i++){
        centipede.push(new CentipedeSegment(centipedeX + 16*i, centipedeY))
    } 
}
// initializes the centipede
centipedeSpawner()

const projectileController = new ProjectileController()
const player = new Player(350, 405, 20, 20, 'rgb(7,68,252)', projectileController)

const detectHit = () => {
    // if any of the obstacles are hit with a projectile, the score increase by 5 and that is displayed appropriately, also if the health of any obstacle reaches 0 it is removed from the array and the canvas
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
    // if a projectile collides with a segment of the centipede body, the score increases by 100 and that is displayed on the screen, that segment is also removed from the centipede array so that it no longer renders on the canvas
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
    // determines the centipede movement behavior when colliding with obstacles
    centipede.forEach((segment) => {
        obstacles.forEach((obstacle) => {
            if (segment.collideWith(obstacle)) {
                // prevents centipede from getting stuck
                if (segment.direction.right && segment.direction.left) {
                    segment.direction.left = false
                    segment.direction.right = false
                    // if the centipede hits an obstacle while moving right it will shift down and then start moving right
                } else if (segment.direction.left && segment.direction.down) {
                    segment.direction.down = false
                    segment.direction.left = false
                    segment.direction.right = true
                    // if the centipede hits an obstacle while moving right it will shift down and then start moving left
                } else if (segment.direction.right && segment.direction.down) {
                    segment.direction.down = false
                    segment.direction.right = false
                    segment.direction.left = true
                } else if (segment.direction.right) {
                    segment.y += 17
                    segment.direction.right = false
                    segment.direction.left = true
                } else if (segment.direction.left) {
                    segment.y += 17
                    segment.direction.left = false
                    segment.direction.right = true
                }
            }
        })
    })
}

const levelUp = () => {
    // if the centipede has no segments left, the game moves to the next level, when moving to the next level the player gets a score boost of 1000 points, the centipede grows 2 additional segments and 5 more obstacles are spawned than the previous level
    if (centipede.length === 0) {
        score += 1000
        scoreDisplay.textContent = `Score: ${score}`
        level++
        centipedeLength += 2
        obstacleLength += 5
        // clears out previous arrays before instantiating new ones with spawner functions
        centipede.length = 0
        obstacles.length = 0
        centipedeSpawner()
        // determines speed of centipede movement based on what level it is, levels 6-12 are at 2x speed and any level beyond 12 is at 4x speed
        centipede.forEach((segment) => {
            if (level >= 6 && level < 12) {
                segment.speed = 4
            } else if (level >= 12) {
                segment.speed = 8
            }
        })
        obstacleSpawner()
    }
}

let functionHolder
// temporarily stores the centipede segments' collision detection function in a variable and then sets it equal to an empty function in order to prevent additional collisions after the segment has collided with the player, that way only one collision is triggered
function disableHitDetection() {
    centipede.forEach((segment) => {
        if (!functionHolder) functionHolder = segment.collideWith
        segment.collideWith = function(){}
    })
}

function enableHitDetection() {
    segment.collideWith = functionHolder
}

let pause = false

const die = () => {
    centipede.forEach((segment) => {
        // determines if any of the centipede segments collide with the player or pass off the bottom of the canvas area
        if (segment.collideWith(player) || segment.y + segment.radius > canvas.height) {
            disableHitDetection()
            lives--
            livesDisplay.textContent = `Lives: ${lives}`
            // if the player runs out of lives the start button is re-enabled so the game can be played again, the high score modal is displayed over the canvas area, the canvas, livesDisplay and scoreDisplay are temporarily removed from the screen, and pause is set to true, stopping the game loop, scoreEntered = false enables the user to input their name to save their high score
            if (lives === 0) {
                startButton.classList.remove('clicked')
                scoreModal.classList.remove('hidden')
                canvas.classList.add('hidden')
                livesDisplay.classList.add('hidden')
                scoreDisplay.classList.add('hidden')
                pause = true
                scoreEntered = false
            }
            // if the player has lives remaining then a new centipede and new obstacles are spawned at the same lenghts as they were before the player died
            centipede.length = 0
            obstacles.length = 0
            centipedeSpawner()
            obstacleSpawner()
        }
    })
}

const gameLoop = () => {
    // if pause is true, end the game loop (this is only triggered when the player runs out of lives)
    if (pause) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    projectileController.render()
    player.render()
    player.movePlayer()
    detectHit()
    levelUp()
    die()
    requestAnimationFrame(gameLoop)
}

const reset = () => {
    // after the game has ended, if the player clicks the start button again the game is reset and all the below variables are returned to their initial values for level one and the centipede and obstacle are spawned
    centipedeLength = 5
    obstacleLength = 10
    centipede.length = 0
    obstacles.length = 0
    lives = 3
    level = 1
    score = 0
    centipedeSpawner()
    obstacleSpawner()
    scoreDisplay.textContent = `Score: ${score}`
    livesDisplay.textContent = `Lives: ${lives}`
    // enables starting the game loop again
    pause = false
}

document.addEventListener('keydown', (e) => {
    player.setDirection(e.key)
})

document.addEventListener('keyup', (e) => {
    if (['w', 'a', 's', 'd', ' '].includes(e.key)) {
        player.unSetDirection(e.key)
    }
})

upButton.addEventListener('click', () => {
    player.direction.up = true
    setTimeout(() => { player.direction.up = false}, 100)
})

rightButton.addEventListener('click', () => {
    player.direction.right = true
    setTimeout(() => { player.direction.right = false}, 100)
})

downButton.addEventListener('click', () => {
    player.direction.down = true
    setTimeout(() => { player.direction.down = false}, 100)
})

leftButton.addEventListener('click', () => {
    player.direction.left = true
    setTimeout(() => { player.direction.left = false}, 100)
})

shootButton.addEventListener('click', () => {
    player.shootPressed = true
    setTimeout(() => { player.shootPressed = false}, 250)
})

startButton.addEventListener('click', (e) => {
    // when the start button is clicked initially, the 'how to play' modal is hidden and the canvas and lives/score displays are revealed
    reset()
    gameLoop()
    e.target.classList.add('clicked')
    modal.classList.add('hidden')
    // when the player clicks the start button after the game has ended (only possible once the player's lives has reached zero, the high score modal is hidden and the play area and stats are restored)
    scoreModal.classList.add('hidden')
    canvas.classList.remove('hidden')
    livesDisplay.classList.remove('hidden')
    scoreDisplay.classList.remove('hidden')
})

let scoreEntered = false
nameInput.addEventListener('keydown', (e) => {
    // if the player hits enter in the input field on the high score modal, the modal is appended with the name inputted and the player's score achieved, then the input field is disabled to prevent multiple inputs between games
    if (e.code === 'Enter' && !scoreEntered) {
        const newHighScoreDiv = document.createElement('div')
        const newHighScoreName = document.createElement('p')
        const newHighScoreScore = document.createElement('p')
        newHighScoreName.id = 'new-high-score-name'
        newHighScoreScore.id = 'new-high-score-score'
        newHighScoreDiv.id = 'new-high-score-div'
        newHighScoreName.textContent = `${nameInput.value}`
        newHighScoreScore.textContent = `${score}`
        newHighScoreDiv.appendChild(newHighScoreName)
        newHighScoreDiv.appendChild(newHighScoreScore)
        highScore.appendChild(newHighScoreDiv)
        scoreEntered = true
    }
})