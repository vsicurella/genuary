
// 3x5 grid
const text = {
    g: [0,1,2,3,6,8,9,10,11,12,13,14],
    e: [0,1,2,3,6,7,8,9,12,13,14],
    n: [0,1,2,3,5,6,8,9,11,12,14],
    u: [0,2,3,5,6,8,9,11,12,13,14],
    a: [0,1,2,3,5,6,7,8,9,11,12,14],
    r: [0,1,2,3,5,6,8,9,10,12,14],
    y: [0,2,3,5,6,7,8,10,13]
}

// Compute areas of rendered shapes
let textRects = {}

const fontSize = 16
const noiseAmt = 5000

// can be optimized...
function getClosestChar(x, y){
    let min_d = 10000
    let min_char = 'u'
    let min_box = 0

    for (const ch in text) {
        let b = 0
        for (const box of textRects[ch]) {
            const cx = box.x + fontSize * 0.5
            const cy = box.y + fontSize * 0.5
            const d = sqrt(pow(cx-x,2)+pow(cy-y,2))
            if (d < min_d) {
                min_d = d
                min_char = ch
                min_box = b
            }
            b++;
        }
    }

    return [min_char, min_box]
}

// Closest block to given position
// function getClosestBlock(x, y, char){
//     let min_box = 0
//     let min_dist = 1000
//     let targetx = 0, targety = 0
//     let i = 0;
//     for (const box of textRects[char]){
//         const centerX = box.x + fontSize / 2;
//         const centerY = box.y + fontSize / 2;
//         const dist = sqrt(pow(centerX-x, 2) + pow(centerY-y, 2))
//         if (dist < min_dist)
//         {
//             min_box = i;
//             min_dist = dist

//             // random target position
//             targetx = Math.random()*fontSize + box.x
//             targety = Math.random()*fontSize + box.y
//         }
//         i++;
//     }

//     return [min_box, targetx, targety]
// }

function lrp(f, x0, y0, x1, y1) {
    const x = x0 + (x1 - x0) * f;
    const y = y0 + (y1 - y0) * f;
    return [x, y];
}

let maxMove = 0
let moveThresh = 0
let cursorX = 180
let cursorY = 200

function calculatePositions() {
    let ch_i = 0;
    for (const ch in text) {
        textRects[ch] = []

        for (const px of text[ch]) {
            const margin = ch_i * (fontSize * 4)
            const x = px % 3
            const y = Math.floor(px / 3)
            textRects[ch].push({
                x: cursorX + margin + x * fontSize, 
                y: cursorY + y * fontSize
                })
        }
        ch_i++;
    }
}

function setup() {
    createCanvas(800, 600);
    calculatePositions()
    maxMove = sqrt(width*width + height*height)
    moveThresh = maxMove * 0.3
    // console.log('maxmove:',maxMove, 'movethresh:', moveThresh)
    
    frameRate(30)
    background(0)
}

function draw() {
    colorMode('rgb')
    background(0,0,0, 30);

    for (const ch in text) {
        for (const box of textRects[ch])  {
            // rect(box.x, box.y, fontSize, fontSize)
        }
    }

    strokeWeight(0)
    colorMode('hsb')
    
    // For each speck of noise, get a random position
    // Then get a random amount it will be closer to the closest letter
    for (var i = 0; i < noiseAmt; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;

        const [char, box] = getClosestChar(x, y);
        const block = textRects[char][box];
        // const [block, cx, cy] = getClosestBlock(x, y, char);
        const targetX = Math.random() * fontSize + block.x;
        const targetY = Math.random() * fontSize + block.y;

        let newx = x;
        let newy = y;

        const gravity = Math.round(Math.random() * 10);
        for (var g = 0; g < gravity; g++) {
            const moveAmt = Math.random();
            [newx,newy] = lrp(moveAmt, newx, newy, targetX, targetY)
        }

        const moved = sqrt(pow(newx-x,2) + pow(newy-y,2));
        const moveFactor = moved/maxMove;
        
        const offset = sqrt(pow(targetX-x, 2) + pow(targetY-y,2));
        const error = sqrt(pow(targetX-newx,2) + pow(targetY-newy, 2))
        const accuracy = 1 - (error / offset);
        
        const hue = (Math.round(moveFactor*360) + 190) % 360
        // const val = Math.round(moveFactor*255)
        const c = color(hue, 100, accuracy * 100)
        // if (i == 0)
        // {
        //     console.log('og',offset, 'error', error, 'ac', accuracy)
        // }
        fill(c)
        square(newx, newy, max(2, moved/moveThresh + 1))
    }

}

function mouseDragged() {
    cursorX = mouseX
    cursorY = mouseY
    calculatePositions()
}

function mouseClicked() {
    cursorX = mouseX
    cursorY = mouseY
    calculatePositions()
}
