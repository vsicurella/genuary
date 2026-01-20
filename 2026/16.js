
function polarScale(scalar, point, center={x:0,y:0})
{
    const xn = point.x-center.x;
    const yn = point.y-center.y;
    const theta = Math.atan2(yn, xn)
    let radius = Math.sqrt(Math.pow(yn,2)+Math.pow(xn,2))
    radius *= scalar;

    const scaled = {...point};
    scaled.x = radius * Math.cos(theta) + center.x;
    scaled.y = radius * Math.sin(theta) + center.y;

    return [scaled, radius];
}

class Shape
{
    age = 0;

    scalar = 1;
    ageScalar = Math.pow(0.5,1/45);

    empty = false

    constructor(points)
    {
        this.center = 
        {
            x: points.reduce((s,i) => s + i[0], 0) / points.length,
            y: points.reduce((s,i) => s + i[1], 0) / points.length
        }

        this.data = [];
        const radii = [];

        let maxRad = 0;
        let minRad = 100000;
        for (var n = 0; n < points.length; n++)
        {
            const x = points[n][0];
            const y = points[n][1];
            const xn = x-this.center.x;
            const yn = y-this.center.y;

            const r = sqrt((xn*xn)+(yn*yn));
            radii.push(r)

            if (r > maxRad)
                maxRad = r;
            if (r < minRad)
                minRad = r

            this.data.push({
                x: x,
                y: y,
                radius: r,
                theta: atan2(yn,xn)
            });
        }

        this.radius_avg = radii.reduce((sum,r) => r + sum, 0) / points.length;
        this.radius_range = maxRad - minRad;

        this.color = color(Math.random()*255,Math.random()*255,Math.random()*255, 0)
    }

    score()
    {
        return this.radius_range / this.radius_avg;
    }

    commit()
    {
        this.data.sort((a,b) => a.theta - b.theta);
    }

    draw()
    {
        strokeWeight(1)
        stroke(0)
        // fill(0,0,0,0)
        fill(this.color)

        beginShape()
        for (var p = 0; p <= this.data.length; p++)
        {   
            const i = p % this.data.length;
            vertex(this.data[i].x, this.data[i].y);
        }
        endShape()

        // fill(0)
        // circle(this.center.x, this.center.y, 10);

        this.advance();
    }

    advance()
    {
        this.age++;
        this.color.setAlpha(this.age*2)
        // this.scalar *= this.ageScalar;

        for (var p = 0; p < this.data.length; p++)
        {
            let radius = this.data[p].radius;
            let point = {x: this.data[p].x, y: this.data[p].y};
            [point, radius] = polarScale(this.ageScalar, point, this.center);
            this.data[p].x = point.x;
            this.data[p].y = point.y
            this.data[p].radius = radius;

            if (radius < 1)
                this.empty = true;
        }
    }
}

class Particle
{
    age = 0
    rate = 1/5000
    empty = false

    stagnancy = 0

    constructor(point) {
        this.x = point.x;
        this.y = point.y;

        this.dx = 0; // velocity
        this.dy = 0;

        this.mx = 0; // accel
        this.my = 0;

        this.color = color(0)
        this.value = 0

        this.target = {x:0,y:0}
        this.speed = pow(0.5, this.rate);
    }

    draw() {
        fill(this.color)
        strokeWeight(1)
        circle(this.x, this.y, 4)

        this.advance();
    }

    advance() {
        this.age++

        this.mx *= this.speed;
        this.my *= this.speed;

        this.dx += this.mx;
        this.dy += this.my;

        this.x += this.dx;
        this.y += this.dy;

        if (this.x < 0 || this.x > width || this.y < 0 || this.y > height)
            this.empty = true;

        if (this.dx < 1e-3 && this.dy < 1e-3){
            this.stagnancy += 1;
            // console.log(this,this.stagnancy)
        }

        if (this.stagnancy > (0.01 / this.rate))
            this.empty = true
    }

    setTarget(position, accelScalar=0.25) {
        if (this.target.x != position.x || this.target.y != position.y) {
            this.target = {
                x: position.x - this.x,
                y: position.y - this.y
            };

            let sx = Math.sign(this.target.x)
            let sy = Math.sign(this.target.y)

            this.mx = pow(abs(this.target.x), this.rate) * sx * accelScalar;
            this.my = pow(abs(this.target.y), this.rate) * sy * accelScalar;
        }
    }
}

const noise = 1000;
const num_particles = 30;

let shapes = [];
let particles = []

function closestShape(point)
{
    let index = -1;
    let distance = 10000;
    for (var s = 0; s < shapes.length; s++)
    {
        const shape = shapes[s];
        const d = dist(point.x, point.y, shape.center.x, shape.center.y);
        if (d < distance)
        {
            distance = d;
            index = s;
        }
    }

    return shapes[index];
}

function setup() {
    createCanvas(500,500)
    frameRate(30)

    // for (var n = 0; n < num_particles; n++)
    // {
    //     const x = Math.random() * width;
    //     const y = Math.random() * height;
    //     particles.push(new Particle(x,y));
    // }
}

function draw() {
    background(255,255,255,48)

    let noises = [];
    for (var n = 0; n < noise; n++)
    {
        strokeWeight(0)
        fill(0)

        const x = Math.random() * width;
        const y = Math.random() * height;
        square(x,y,1);

        noises.push([x,y]);
    }

    const MIN_POLY = 3;
    const MAX_POLY = 24;
    const polygon = Math.round(Math.random() * (MAX_POLY-MIN_POLY) + MIN_POLY);
    const samples = [];
    for (var n = 0; n < polygon; n++)
    {
        const i = Math.floor(Math.random() * noise);
        samples.push(noises[i]);
    }

    const shape = new Shape(samples);
    const particle = new Particle(shape.center)
    particle.setTarget({x: width/2, y: height/2}, 2);

    particles.push(particle)

    const GOOD = 5/8;
    if (abs(shape.score() - GOOD) < 0.25)
    {
        // console.log('nice shape!', JSON.stringify(shape));
        shape.commit();
        shapes.splice(0, 0, shape)
    }

    for (var s = 0; s < shapes.length; s++)
    {
        const shape = shapes[s];
        shape.draw();
    }

    shapes = shapes.filter((s) => s.empty === false);

    if (shapes.length > 0) for (var p = 0; p < particles.length; p++)
    {
        particles[p].draw();

        const shape = closestShape(particles[p]);
        particles[p].setTarget(shape.center);
    }

    particles = particles.filter(p => p.empty === false);
}
