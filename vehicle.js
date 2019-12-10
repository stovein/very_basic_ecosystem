class Vehicle {
    constructor(x, y) {
        // Constructing place in a given position
        this.pos = createVector(x, y);
        this.vel = p5.Vector.random2D();
        this.acc = createVector();
        this.gender = floor(random(1) + 0.5);
        this.fitness = 0;

        // genes of the object
        this.dna = [];
        this.dna[0] = random(-1, 1); // food force
        this.dna[1] = random(-1, 1); // poison force
        this.dna[2] = random(0, 1); // wellbeing
        this.dna[3] = random(0.2, 1); // size ;rn unused
    }

    applyStats() {
        // attributes of object that affected by genes
        this.size = 20; //this.dna[3] * 20; // 4 - 20
        this.wellbeing = this.dna[2];
        this.maxSpeed = 2; //6 - this.size / 4; // 1 - 5
        this.maxForce = 0.5; //this.size / 20; // .2 - 1
        this.maxHealth = this.wellbeing * 100 + 50; // 50 - 150
        this.energyConsumption = 6 + this.wellbeing * 10 - this.size / 4; // 1 - 15
        this.attractiveness = this.size; // 4 - 20

        this.reproductiveUrge = 0; // 0 - 1
        this.health = this.maxHealth;
    }

    behave(foods, poisons) {
        let eat = this.eat(foods, 5);
        let run = this.eat(poisons, -5);

        eat.mult(5 * this.dna[0]);
        run.mult(5 * this.dna[1]);

        this.applyForce(run);
        this.applyForce(eat);
    }

    reproduction(vehicles, rate) {
        let partner = this.searchPartner(vehicles, rate);
        partner.mult(5 * this.reproductiveUrge);
        this.applyForce(partner);
    }

    eat(list, nurt) {
        let rec = Infinity;
        let closest = -1;
        for (let i = 0; i < list.length; i++) {
            let d = this.pos.dist(list[i]);
            if (d < rec) {
                rec = d;
                closest = i;
            }
        }
        if (rec < 5) {
            list.splice(closest, 1);
            this.diet(nurt);
        } else if (closest > -1) return this.seek(list[closest]);
        return this.seek(createVector(width / 2, height / 2));
    }

    searchPartner(list, rate) {
        let rec = Infinity;
        let closest = -1;
        for (let i = 0; i < list.length; i++) {
            let condition = list[i].fitness + 0.2 >= this.fitness;
            if (list[i].gender != this.gender && condition) {
                let d = this.pos.dist(list[i].pos);
                if (d < rec) {
                    rec = d;
                    closest = i;
                }
            }
        }
        if (rec < 5) {
            let child = this.intercourse(list[closest], rate);
            list.push(child);
        } else if (closest > -1) {
            return this.seek(list[closest].pos);
        }
        return this.seek(createVector(width / 2, height / 2));
    }

    intercourse(partner, rate) {
        // Creation and Eliminating Desires
        if (partner.gender != this.gender) {
            this.reproductiveUrge = 0;
            partner.reproductiveUrge = 0;
            let child = new Vehicle(this.pos.x, this.pos.y);

            // Crossover
            let midPoint = floor(random(this.dna.length));
            for (let i = 0; i < this.dna.length; i++) {
                if (i < midPoint) child.dna[i] = this.dna[i];
                else child.dna[i] = partner.dna[i];
            }
            child.mutate(rate);
            // Applying Dna effects and returning the child
            child.applyStats();
            if (partner.fitness < 1)
                partner.fitness += partner.reproductiveUrge / 100;
            if (this.fitness < 1) this.fitness += this.reproductiveUrge / 100;
            return child;
        }
        return;
    }

    diet(nurt) {
        if (nurt > 0) {
            if (this.health < this.maxHealth) {
                this.health += nurt;
            }
        } else if (nurt < 0) {
            this.health += nurt;
        }
        this.fitness += nurt / 1000;
        this.fitness = this.fitness < 0 ? 0 : this.fitness;
    }

    isDead() {
        if (this.health <= 0) return true;
        else return false;
    }

    seek(target) {
        let desired = p5.Vector.sub(target, this.pos);
        desired.setMag(this.maxSpeed);
        let steer = p5.Vector.sub(desired, this.vel);
        steer.limit(this.maxForce);
        return steer;
    }

    mutate(mutationRate) {
        for (let i = 0; i < this.dna.length; i++) {
            let r = random(1);
            if (r < mutationRate) {
                let mutation =
                    random(-1, 1) < 0 ? random(-0.3, -0.1) : random(0.1, 0.3);
                this.dna[i] += mutation;
                if (i > 1)
                    this.dna[i] =
                        this.dna[i] < 0 ? 0 : this.dna[i] > 1 ? 1 : this.dna[i];
                else if (i === 0 || i === 1)
                    //
                    this.dna[i] =
                        this.dna[i] < -1
                            ? -1
                            : this.dna[i] > 1
                            ? 1
                            : this.dna[i];
            }
        }
    }

    applyForce(f) {
        this.acc.add(f);
    }

    update() {
        this.pos.add(this.vel);
        this.vel.add(this.acc);
        this.acc.mult(0);
    }

    show() {
        let angle = this.vel.heading() + PI / 2;
        push();
        translate(this.pos.x, this.pos.y);
        rotate(angle);
        strokeWeight(2);
        noFill();
        stroke(0, 255, 0);
        line(0, 0, 0, -this.dna[0] * 25);
        let c = map(this.health, 0, this.maxHealth, 50, 255);
        if (this.gender === 1) stroke(0, c, c);
        else stroke(c, 0, c);
        strokeWeight(this.size);
        point(0, 0);
        pop();
    }

    /*                
    if (fiveClosest.length < 5) fiveClosest.push([d, i]);
    else {
        let smallest = [Infinity, -1];
        for (let j = 0; j < fiveClosest.length; j++) {
            smallest =
                smallest[0] > fiveClosest[j][0]
                    ? fiveClosest[j]
                    : smallest;
        }
        fiveClosest.splice(smallest[1], 1);
        fiveClosest.push(d, i);
    }
    */
}
