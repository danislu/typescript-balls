module Dsl {

    export class Pool { 

        collection: BallCollection;

        constructor (public height : number, public width : number, public context, ballCount: number = 1) {
            if (ballCount < 1) ballCount = 1;
            var i,
                ball : Ball,
                balls : Ball[];

            for (i = 0; i < ballCount; i++) {
                ball = new Ball(context, new Point(Math.random() * width, Math.random() * height, 0));
                balls.push(ball);
            }
           
            this.collection = new BallCollection();
            this.collection.balls = balls;
        }

        tick() {
            this.collection.update();
            this.collection.draw();
        }
    }

    class BallCollection {
        balls: Ball[];

        draw() {

            var ball: Ball,
                prop: string;

            // update all balls position
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
                ball.update();
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
                        otherBall.velocity = ball.velocity = new Vector(0, 0, 0);
                    }
                }
            }
        }
    }

    class Ball {
        touched: bool;
        velocity: Vector;
        
        constructor (public context, public location: Point, public size: number = 10, public colour: string = "black") { }

        draw() {
            //this.context
        }

        update(steps: number = 1) {
            var i;

            this.touched = false;
            for (i = 0; i < steps; i++) {
                this.location.x += this.velocity.x;
                this.location.y += this.velocity.y;
                this.location.z += this.velocity.z;

                this.velocity.update(0.1);
            }
        }

        isCrashed(otherBall: Ball): bool {
            var x = Math.abs(this.location.x - otherBall.location.x);
            var y = Math.abs(this.location.y - otherBall.location.y);
            var z = Math.abs(this.location.z - otherBall.location.z);

            var dist = Math.sqrt(x * x + y * y + z * z)

            return dist <= 20;
        }
    }

    class Point {
        constructor (public x: number, public y: number, public z: number) { }
    }

    class Vector extends Point {
        constructor (x: number, y: number, z: number) {
            super(x, y, z);
        }
        update(friction: number) {
            this.x *= friction;
            this.y *= friction;
            this.z *= friction;
        }
    }

}
