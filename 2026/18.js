
class Point
{
    constructor(x, y)
    {
        this.x = x
        this.y = y
    }
}

// CONSTS
const PI2 = 2 * Math.PI

// PARAMS
const FRAMERATE = 60;
const SMOOTH = 100;

let FRAME = 0;
let target = null
let cycles = 15
let radsPerSecond = Math.PI
let maxMod = 1

// CALCULATIONS
let start = new Point(0, 0)
let loopFrames = 0
let radsPerFrame = 0
let scalePerFrame = 0

let startTheta = 0
let totalTheta = 0
let totalRadius = 0

let maxRadius = 0

let resetFrames = 0

// DYNAMICS
let lastX = 0
let lastY = 0

let currentX = 0
let currentY = 0

let lastTheta = 0
let lastRadius = 0

let currentTheta = 0
let currentRadius = 0

let secondsModulus = 2
let secondsPeriod = 1

function lrp(f, x0, x1) {
    return x0 + (x1 - x0) * f;
}

function calculate()
{
    FRAME = 0;
    target = new Point(width / 2, height / 2)

    startTheta = -3/4 * Math.PI;
    const startPoint = new Point(
        width/2 * cos(startTheta) + target.x,
        height/2 * sin(startTheta) + target.y,
    );
    start = startPoint

    // startTheta = atan2(target.y - start.y, target.x - start.x) + Math.PI
    totalTheta = cycles * 2 * Math.PI

    radsPerFrame = radsPerSecond / FRAMERATE
    loopFrames = ceil(totalTheta / radsPerFrame)

    totalRadius = dist(start.x,start.y,target.x,target.y)
    scalePerFrame = totalRadius / loopFrames

    lastX = start.x
    lastY = start.y
    currentX = start.x
    currentY = start.y
    currentTheta = startTheta
    currentRadius = totalRadius
    
    // console.log(startTheta, totalTheta, radsPerFrame, loopFrames, totalRadius, scalePerFrame)

    const date = new Date()
    secondsModulus = date.getSeconds()
    secondsPeriod = ceil(secondsModulus / 2)

    resetFrames = loopFrames * 2 + FRAMERATE * 3;
}

function getModAmt(theta, scalar=1)
{
    const degrees = abs(Math.round(theta * 360) - 180)
    return scalar * (secondsPeriod - abs((degrees % secondsModulus) - secondsPeriod)) / secondsPeriod;
}

function getPosition(theta, radius, modAmt=0)
{
    radius += modAmt * totalRadius / cycles
    const x = radius * cos(theta) + target.x
    const y = radius * sin(theta) + target.y
    return new Point(x, y)
}

function advance()
{
    FRAME = (FRAME + 1)// % (loopFrames*2)

    lastX = currentX
    lastY = currentY

    lastTheta = currentTheta
    lastRadius = currentRadius

    currentTheta = (startTheta + radsPerFrame * FRAME) % PI2
    currentRadius = totalRadius - scalePerFrame * FRAME

    const frameX = ((loopFrames) - abs(FRAME - loopFrames)) / loopFrames
    const modAmt = getModAmt(currentTheta, pow(maxMod * frameX + 3, 2));
    const position = getPosition(currentTheta, currentRadius, modAmt)
    currentX = position.x
    currentY = position.y
}

function divert()
{
    const thresh = 20;
    const toMouse = dist(currentX, currentY, mouseX, mouseY)
    if (abs(toMouse - thresh) <= thresh)
    {
        currentRadius += (thresh - toMouse)
        currentX = currentRadius * cos(currentTheta) + target.x
        currentY = currentRadius * sin(currentTheta) + target.y
    }
}

function reset()
{
    clear()
    setup()
}

function setup()
{
    createCanvas(500, 500)
    frameRate(FRAMERATE)
    calculate()

    background(255)

    strokeWeight(1)
}

function draw()
{
    if (FRAME >= resetFrames)
    {
        reset();
        return;
    }

    // background(255)

    // divert()

    fill(0)
    // fill(255,0,0)
    // for (var i = 1; i < SMOOTH; i++)
    // {
    //     const f = i / SMOOTH;
    //     const thetaSmooth = lrp(f, lastTheta, currentTheta)
    //     const radSmooth = lrp(f, lastRadius, currentRadius)
    //     const modAmt = getModAmt(thetaSmooth)
    //     const position = getPosition(thetaSmooth, radSmooth, modAmt);
    //     circle(position.x, position.y, 4)
    // }
    // fill(0,0,0)
  
    // circle(currentX, currentY, 4)
    stroke(0)
    line(lastX, lastY, currentX, currentY)
    
    advance()
}