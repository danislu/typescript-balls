module Dsl {

    var friction: number = 0.95;
    var speed: number = 0.3;

    export class Pool {

        collection: BallCollection;

        constructor (public height: number, public width: number, public xOffset: number, public yOffset: number, public ctx, ballCount: number = 30) {
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
                var hitPoint = getHitPoint(e),
                prop: string,
                ball: Ball;

                for (prop in this.collection.balls) {
                    ball = this.collection.balls[prop];
                    if (ball.isHit(hitPoint)) {
                        this.startPoint = ball.location;
                        this.currentBall = ball;
                        this.currentBall.isActive = true;
                        break;
                    }
                }
            }

            window.onmousemove = (e) => {
                if (this.currentBall) {
                    this.currentPoint = getHitPoint(e);
                }
            }

            window.onmouseup = (e) => {
                if (this.currentBall && this.startPoint) {
                    this.currentPoint = getHitPoint(e);

                    this.currentBall.velocity.add(getVector(this.startPoint, this.currentPoint));
                    this.currentBall.isActive = false;
                }
                this.currentBall = null;
                this.startPoint = null;
                this.currentPoint = null;
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
                setTimeout(() => { this.tick() });
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

        static moveBallsBack(ballA: Ball, ballB: Ball) {
            //var dist = 21 - ballA.location.distanceTo(ballB.location);

            //var speed = ballA.velocity.getSize();
            //var otherSpeed = ballB.velocity.getSize();

            //var totalSpeed = speed + otherSpeed;
            //var oneP = totalSpeed / 100;

            //var speedPart = (speed / oneP) / 100;
            //var otherSpeedPart = (otherSpeed / oneP) / 100;
            //if (otherSpeedPart < 0.001) {
            //    otherSpeedPart = 0;
            //    speedPart = 1;
            //}
            //if (speedPart < 0.001) {
            //    otherSpeedPart = 1;
            //    speedPart = 0;
            //}

            //var oneDist = dist * speedPart;
            //var negV = ballA.velocity.negativeClone();
            //var negSize = negV.getSize();
            //var rel = (negSize != 0)
            //    ? oneDist / negSize
            //    : 0;

            //ballA.location.x += negV.x * rel;
            //ballA.location.y += negV.y * rel;
            //ballA.location.z += negV.z * rel;

            //var oneDist2 = dist * otherSpeedPart;
            //var negV2 = ballB.velocity.negativeClone();
            //var negSize2 = negV2.getSize();

            //var rel2 = (negSize2 != 0)
            //        ? oneDist2 / negSize2
            //        : 0;

            //ballB.location.x += negV2.x * rel2;
            //ballB.location.y += negV2.y * rel2;
            //ballB.location.z += negV2.z * rel2;

            
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
                    if (otherBall.isTouching(ball))
                        continue;

                    if (ball.isCrashed(otherBall)) {
                        ball.addTouching(otherBall);
                        otherBall.addTouching(ball);

                        var distanseBefore = ball.location.distanceTo(otherBall.location);
                        BallCollection.moveBallsBack(ball, otherBall);
                        var distanseAfter = ball.location.distanceTo(otherBall.location);

                        var dx = ball.location.x - otherBall.location.x;
                        var dy = ball.location.y - otherBall.location.y;

                        ball.velocity.x += (dx * 0.1);
                        ball.velocity.y += (dy * 0.1);
                        otherBall.velocity.x -= (dx * 0.1);
                        otherBall.velocity.y -= (dy * 0.1);
                    }
                }
            }
        }
    }

    class Ball {
        static ballCount: number = 0;
        private contactingBalls: Ball[] = new Ball[];
        public addTouching(ball: Ball): void {
            if (!this.isTouching(ball))
                this.contactingBalls.push(ball);
        }
        public removeTouching(ball: Ball): void {
            if (this.isTouching(ball)) {
                var index = this.contactingBalls.indexOf(ball);
                this.contactingBalls.splice(index);
            }
        }
        public clearTouching(): void {
            this.contactingBalls = null;
            this.contactingBalls = new Ball[];
        }
        public isTouching(ball?: Ball): bool {
            if (!ball)
                return this.contactingBalls.length != 0;

            return this.contactingBalls.indexOf(ball, 0) >= 0;
        }
        public velocity: Vector = new Vector(0, 0);
        public isActive: bool;
        private no: number;
        constructor (public context, public location: Point, public size: number = 10, public colour: string = "white") {
            this.no = Ball.ballCount++;
        }

        draw() {
            if (this.isActive)
                this.context.fillStyle = "orange";
            else if (this.isTouching())
                this.context.fillStyle = "red";
            else
                this.context.fillStyle = this.colour;

            this.context.beginPath();
            this.context.arc(this.location.x, this.location.y, this.size, 0, 360, false);
            this.context.closePath();
            this.context.fill();

            if (this.isActive)
                this.context.strokeStyle = "black";
            else
                this.context.strokeStyle = "gray";
            this.context.beginPath();
            this.context.arc(this.location.x, this.location.y, this.size, 0, Math.PI * 2, true);
            this.context.closePath();
            this.context.stroke();

            this.context.fillStyle = "black";
            this.context.font = "10px Georgia";
            var txt = this.no.toString();
            var width = this.context.measureText(txt).width;
            this.context.fillText(txt, this.location.x - width / 2, this.location.y + 3);
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


            this.clearTouching()
            for (i = 0; i < steps; i++) {
                this.velocity.addFriction(friction);

                this.location.x = getNewValue(this.location.x, this.velocity.x, width);
                this.location.y = getNewValue(this.location.y, this.velocity.y, heigth);
                this.location.z += this.velocity.z;
            }
        }

        toString() {
            return this.no.toString();
        }

        isCrashed(otherBall: Ball): bool {
            var dist = this.location.distanceTo(otherBall.location);
            return dist < 20;
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

        getSize() {
            return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
        }

        negativeClone(): Vector {
            return new Vector(this.x * -1, this.y * -1, this.z * -1);
        }
    }
}
