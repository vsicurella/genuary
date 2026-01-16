
const PHASES = {
    SYNC_0: 'sync0',
    SYNC_1: 'sync1',
    TWOS_EVEN: 'twos-even',
    TWOS_ODD: 'twos-odd',
    THREES_M0: 'threes-m0',
    THREES_M1: 'threes-m1',
    THREES_M2: 'threes-m2',
    FIVES_M0: 'fives-m0',
    FIVES_M3: 'fives-m3',
    PRIMES: 'primes',
    SUPERCOMPS: 'supercomps',
}
const PHASE_KEYS = Object.keys(PHASES)

const HARMONICS = {};
const harmonics = 64;

const PARAMS = {
    RADIUS_MOD_X: 'radius-mod-x',
    RADIUS_MOD_Y: 'radius-mod-y',
    TH_OFFSET_X: 'theta-offset_x',
    TH_OFFSET_Y: 'theta-offset_y',
}

function lrp(f, x0, y0, x1, y1) {
    const x = x0 + (x1 - x0) * f;
    const y = y0 + (y1 - y0) * f;
    return [x, y];
}

function setup() {
    createCanvas(600, 600)    
    frameRate(30)
    background(0)

    for (var h = 0; h < harmonics; h++)
    {
        const params = {}
        params[PARAMS.RADIUS_MOD_X] = 1;
        params[PARAMS.RADIUS_MOD_Y] = 1;
        params[PARAMS.TH_OFFSET_X] = 0;
        params[PARAMS.TH_OFFSET_Y] = 0;

        HARMONICS[h] = params
    }
}

let elapsed = 0;
let loopLength = 50000;

let cursorX = 0;
let cursorY = 0;

let phase = PHASES.FIVES_M0;

function draw() {
    colorMode('hsl')
    background(0,0,0, 0.1)
    // background(0)

    elapsed = (elapsed + deltaTime) % loopLength;

    // params
    const rad_spacing = 10;
    
    // const min_radius_mod = 17/13;
    const min_radius = 0;
    // const max_radius = sqrt(width * height)/2 + 25;
    
    const centerX = width * 0.5;
    const centerY = height * 0.5;
    const breathTime = loopLength/100;
    const offsetTime = loopLength;
    const phaseTime = loopLength / PHASE_KEYS.length;
    const sizeTime = loopLength * 7;

    // helpers
    // const radius_length = max_radius - min_radius;
    const max_harm_radius = harmonics * rad_spacing;
    const PI_2 = 2 * PI;

    const phaseIndex = floor(elapsed / phaseTime) % PHASE_KEYS.length;
    phase = PHASES[PHASE_KEYS[phaseIndex]];

    for (var h = 0; h < harmonics; h++)
    {
        const params = HARMONICS[h];

        const ph = h / harmonics;
        const radius = ph * max_harm_radius + min_radius;

        // todo - accumulate instead of calculate
        params[PARAMS.RADIUS_MOD_X] = (sin(elapsed/breathTime) + 1) / 4 + 0.333
        params[PARAMS.RADIUS_MOD_Y] = params[PARAMS.RADIUS_MOD_X];
        
        const oftwo = h % 2;
        const ofthree = h % 3;
        const offive = h % 5 

        switch (phase)
        {

        case PHASES.SYNC_0:
        case PHASES.SYNC_1:
            params[PARAMS.TH_OFFSET_X] = 0;
            params[PARAMS.TH_OFFSET_Y] = 0;
            break;

        case PHASES.TWOS_ODD:
        {
            const direction = -1 + 2 * !oftwo;
            params[PARAMS.TH_OFFSET_X] = ((PI_2 * elapsed / offsetTime) % PI_2) * direction;
            params[PARAMS.TH_OFFSET_Y] = ((PI_2 * elapsed / offsetTime) % PI_2) * direction;
            break;
        }

        case PHASES.TWOS_EVEN:
        default:
        {
            const direction = -1 + 2 * oftwo;
            params[PARAMS.TH_OFFSET_X] = ((PI_2 * elapsed / offsetTime) % PI_2) * direction;
            params[PARAMS.TH_OFFSET_Y] = ((PI_2 * elapsed / offsetTime) % PI_2) * direction;
            break;
        }    

        case PHASES.THREES_M0:
        case PHASES.THREES_M1:
        case PHASES.THREES_M2:
        {
            let direction;
            switch (phase)
            {
            default:
            case PHASES.THREES_M0:
                direction = ((ofthree + 1) % 3) - 1;
                break;
            case PHASES.THREES_M1:
                direction = ((ofthree) % 3) - 1;
                break;
            case PHASES.THREES_M2:
                direction = ((ofthree + 2) % 3) - 1;
                break;
            }

            params[PARAMS.TH_OFFSET_X] = ((PI_2 * elapsed / offsetTime) % PI_2) * direction;
            params[PARAMS.TH_OFFSET_Y] = ((PI_2 * elapsed / offsetTime) % PI_2) * direction;

            break;
        }
        case PHASES.FIVES_M0:
        case PHASES.FIVES_M3:
        {
            let direction;
            switch (phase)
            {
            default:
            case PHASES.FIVES_M0:
                direction = (((offive + 3) % 5) % 3) - 1;
                break;
            case PHASES.FIVES_M3:
                direction = (((offive) % 5) % 3) - 1;
                break;
            }

            params[PARAMS.TH_OFFSET_X] = ((PI_2 * elapsed / offsetTime) % PI_2) * direction;
            params[PARAMS.TH_OFFSET_Y] = ((PI_2 * elapsed / offsetTime) % PI_2) * direction;

            break;
        }
        }

        for (var n = 0; n < (h+1); n++)
        {
            const theta = PI_2 * n / (h+1);
            const x = radius * params[PARAMS.RADIUS_MOD_X] * cos(theta + params[PARAMS.TH_OFFSET_X]) + centerX;
            const y = radius * params[PARAMS.RADIUS_MOD_Y] * sin(theta + params[PARAMS.TH_OFFSET_Y]) + centerY;

            const hue = (360 * (h/harmonics + (elapsed / loopLength * 13))) % 360;  
            strokeWeight(0)
            fill(hue, 100,50, 0.8)

            const size = (sin(elapsed / sizeTime) + 1) * 2.5 + 1 
            circle(x, y, size)
        }
    }

}

function mouseDragged() {
    // cursorX = mouseX
    // cursorY = mouseY
    // calculatePositions()
}

function mouseClicked() {
    // cursorX = mouseX
    // cursorY = mouseY
    // calculatePositions()
}

function oldsketch() {
    const dotsT = 60;
    const dotsR = 28;
    
    const min_radius_mod = 17/13;
    const min_radius = 12;
    const max_radius = sqrt(width * height)/2 + 25;
    
    const centerX = width * 0.5;
    const centerY = height * 0.5;
    const breathTime = loopLength;
    const offsetTime = loopLength;
    // helpers
    const radius_length = max_radius - min_radius;
    const PI_2 = 2 * PI;

    for (var th = 0; th < dotsT; th++) {
        const theta = 2*Math.PI * th/dotsT;
        
        // const direction = -1 + 2 * (th % 2);
        const offset =  (PI_2 * elapsed / offsetTime) % PI_2;
        
        // const cost = cos(theta + offset);
        // const sint = sin(theta + offset);

        for (var rad = 0; rad < dotsR; rad++) {
            const btheta = (PI_2 * elapsed / breathTime) % PI_2;

            const mod_length = radius_length * (sin(btheta) + 1 + min_radius_mod);
            const radius = (rad/dotsR * mod_length) + min_radius;

            const direction = -1 + 2 * (rad % 2);
            const cost = cos(theta + offset*direction);
            const sint = sin(theta + offset*direction);

            const x = radius * cost + centerX;
            const y = radius * sint + centerY;

            const r = floor(cost + 1 * 128)
            const b = floor(sint + 1 * 128)
            const g = floor((theta / PI_2 * 2 - 1) * direction * 128 + 128);
            const c = color(r,g,b);
            // const hue = (Math.round(moveFactor*360) + 190) % 360
            // const val = Math.round(moveFactor*255)
            // const c = color(hue, 100, accuracy * 100)
            // if (i == 0)
            // {
            //     console.log('og',offset, 'error', error, 'ac', accuracy)
            // }
            fill(c)
            strokeWeight(0)
            // square(newx, newy, max(2, moved/moveThresh + 1))
            circle(x, y, 6);
        }
    }
}