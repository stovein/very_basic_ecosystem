const mutationRate = 0.1;
const population = 100;

let vehicles = [];
let foods = [];
let poisons = [];

// ***************************************************************

function setup() {
    createCanvas(800, 600);
    background(51);
    frameRate(60);
    createVehicle(population);
    createFood(population * 2);
    createPoison(population);
}

function draw() {
    background(51);
    let mod = 300 * (1 + floor(vehicles.length / 200));
    if (frameCount % mod === 0) {
        createFood(vehicles.length);
        createPoison(vehicles.length);
    }
    drawVehicle();
    drawFood();
    drawPoison();
    drawTexts();
    controller();
}

// *******************************************************************

function drawTexts() {
    push();
    fill(170);
    textSize(20);
    text("Vehicle Count: ", 10, 20);
    text(vehicles.length, 140, 20);
    text("Food Count: ", 10, 40);
    text(foods.length, 140, 40);
    text("Poison Count: ", 10, 60);
    text(poisons.length, 140, 60);
    pop();
}

function createFood(number) {
    for (let i = 0; i < number; i++) {
        foods.push(createVector(random(width), random(height)));
    }
}

function drawFood() {
    foods.forEach(food => {
        noStroke(200);
        fill(0, 255, 0);
        ellipse(food.x, food.y, 8, 8);
    });
}

function createPoison(number) {
    for (let i = 0; i < number; i++) {
        poisons.push(createVector(random(width), random(height)));
    }
}

function drawPoison() {
    poisons.forEach(poison => {
        noStroke(200);
        fill(255, 0, 0);
        ellipse(poison.x, poison.y, 8, 8);
    });
}

function createVehicle(number) {
    for (let i = 0; i < number; i++) {
        var vehicle = new Vehicle(random(width), random(height));
        vehicle.applyStats();
        vehicles.push(vehicle);
    }
}

function drawVehicle() {
    for (let i = vehicles.length - 1; i >= 0; i--) {
        let v = vehicles[i];
        if (v.reproductiveUrge > 0.5 && v.health > 30)
            v.reproduction(vehicles, mutationRate);
        else v.behave(foods, poisons);

        if (v.isDead()) vehicles.splice(i, 1);
        if (frameCount % 60 === 0) {
            v.health -= v.energyConsumption;
            v.reproductiveUrge += 0.05;
            v.reproductiveUrge =
                v.reproductiveUrge > 1 ? 1 : v.reproductiveUrge;
        }
        v.update();
        v.show();
    }
}

function topFitness() {
    let maxFit = 0;
    vehicles.forEach(v => {
        if (v.fitness > maxFit) maxFit = v.fitness;
    });
    return maxFit;
}

function controller() {
    vehicles.forEach(v => {
        if (v.energyConsumption < 1)
            console.log("energy " + v.energyConsumption);
        if (v.maxHealth < 50) console.log("health " + v.maxHealth);
    });
}
