module Dsl {

    var friction: number = 0.95;
    var speed: number = 0.5;

    export class Pool {

        collection: BallCollection;

        constructor (public height: number, public width: number, public xOffset: number, public yOffset: number, public ctx, ballCount: number = 2) {
            var i: number,
            ball: Ball,
            balls: Ball[] = new Ball[];

            if (ballCount < 1) ballCount = 1;

            for (i = 0; i < ballCount; i++) {
                ball = new Ball(ctx, new Point(Math.random() * width, Math.random() * height, 0));
                balls.push(ball);
            }

            this.collection = new BallCollection(height, width);
            this.collection.balls = balls;

            function getHitPoint(e: MouseEvent): Point {
                return new Point(e.pageX - xOffset, e.pageY - yOffset);
            }

            window.onmousedown = (e) => {
                this.currentPoint = null;
                this.startPoint = null;

                var hitPoint = getHitPoint(e),
                prop: string,
                ball: Ball;

                for (prop in this.collection.balls) {
                    ball = this.collection.balls[prop];
                    if (ball.isHit(hitPoint)) {
                        this.startPoint = ball.location;
                        this.currentBall = ball;
                        break;
                    }
                }
            }

            window.onmousemove = (e) => {
                if (this.currentBall != null) {
                    this.currentPoint = getHitPoint(e);
                }
            }

            window.onmouseup = (e) => {
                if (this.currentBall != null && this.startPoint != null) {
                    this.currentPoint = getHitPoint(e);

                    this.currentBall.velocity.add(getVector(this.startPoint, this.currentPoint));
                }
                this.currentBall = null;
                this.startPoint = null;
            }
        }

        private currentBall: Ball;
        private startPoint: Point;
        private currentPoint: Point;
        private running: bool = false;
        public start() {
            this.running = true;
            this.tick();
        }

        public stop() {
            this.running = false;
        }

        private tick() {
            this.ctx.clearRect(0, 0, this.width, this.height);

            this.collection.update();
            this.collection.draw();

            this.draw();

            if (this.running) {
                setTimeout(() => {
                    this.tick()
                }, 10);
            }
        }

        private draw() {
            if (this.startPoint && this.currentPoint) {
                this.ctx.strokeStyle = "black";
                this.ctx.beginPath();
                this.ctx.moveTo(this.startPoint.x, this.startPoint.y);
                this.ctx.lineTo(this.currentPoint.x, this.currentPoint.y);
                this.ctx.closePath();
                this.ctx.stroke();
            }
        }
    }

    class BallCollection {
        balls: Ball[];

        constructor (private height: number, private width: number) { }

        draw() {
            var ball: Ball,
            prop: string;

            for (prop in this.balls) {
                ball = this.balls[prop];
                ball.draw();
            }
        }

        update() {
            var touched: Ball[],
            ball: Ball,
            otherBall: Ball,
            prop: string;

            // update all balls position
            for (prop in this.balls) {
                ball = this.balls[prop];
                ball.update(this.height, this.width);
            }

            // check for collisions
            for (prop in this.balls) {
                ball = this.balls[prop];
                for (prop in this.balls) {
                    otherBall = this.balls[prop];
                    if (otherBall === ball)
                        continue;

                    if (ball.isCrashed(otherBall)) {
                        ball.touched = otherBall.touched = true;

                        var dist = ball.location.distanceTo(otherBall.location);

                        ball.velocity = new Vector(0, 0, 0);
                        otherBall.velocity = new Vector(0, 0, 0);
                    }
                }
            }
        }
    }

    class Ball {
        touched: bool;
        velocity: Vector = new Vector(0, 0);

        constructor (public context, public location: Point, public size: number = 10, public colour: string = "white") { }

        draw() {
            if (this.touched)
                this.context.fillStyle = "red";
            else
                this.context.fillStyle = this.colour;

            this.context.beginPath();
            this.context.arc(this.location.x, this.location.y, this.size, 0, 360, false);
            this.context.closePath();
            this.context.fill();

            this.context.strokeStyle = "gray";
            this.context.beginPath();
            this.context.arc(this.location.x, this.location.y, this.size, 0, Math.PI*2, true);
            this.context.closePath();
            this.context.stroke();
        }

        update(heigth: number, width: number, steps: number = 1) {
            var i;

            function getNewValue(loc: number, vel: number, wall: number): number {
                var velocity = vel * speed;
                var newX = loc + velocity;
                if (newX > wall) {
                    return velocity;
                }
                else if (newX < 0) {
                    return wall + velocity;
                }
                return newX;
            }

            this.touched = false;
            for (i = 0; i < steps; i++) {
                this.velocity.addFriction(friction);

                this.location.x = getNewValue(this.location.x, this.velocity.x, width);
                this.location.y = getNewValue(this.location.y, this.velocity.y, heigth);
                this.location.z += this.velocity.z;                
            }
        }

        isCrashed(otherBall: Ball): bool {
            var dist = this.location.distanceTo(otherBall.location);
            return dist <= 20;
        }

        isHit(hit: Point): bool {
            var dist = this.location.distanceTo(hit);
            return dist <= this.size;
        }


    }

    class Point {
        constructor (public x: number, public y: number, public z: number = 0) { }

        distanceTo(other: Point): number {
            var x = Math.abs(this.x - other.x);
            var y = Math.abs(this.y - other.y);
            var z = Math.abs(this.z - other.z);

            return Math.sqrt(x * x + y * y + z * z);
        }
    }

    function getVector(a: Point, b: Point): Vector {
        return new Vector(a.x - b.x, a.y - b.y, a.z - b.z);
    }

    class Vector extends Point {
        constructor (x: number, y: number, z: number = 0) {
            super(x, y, z);
        }

        addFriction(friction: number) {
            this.x *= friction;
            this.y *= friction;
            this.z *= friction;
        }

        add(vector: Vector) {
            this.x += vector.x;
            this.y += vector.y;
            this.z += vector.z;
        }
    }
}
