module Dsl {

    export class Pool { 

        collection: BallCollection;

        constructor (public height : number, public width : number, public xOffset : number, public yOffset : number, public context, ballCount: number = 1) {
            var i : number,
                ball : Ball,
                balls : Ball[] = new Ball[];

            if (ballCount < 1) ballCount = 1;

            for (i = 0; i < ballCount; i++) {
                ball = new Ball(context, new Point(Math.random() * width, Math.random() * height, 0));
                balls.push(ball);
            }
           
            this.collection = new BallCollection();
            this.collection.balls = balls;

            function getHitPoint(e: MouseEvent) : Point {
                return new Point(e.pageX - xOffset, e.pageY - yOffset);
            }

            window.onmousedown = (e) => {
                var hitPoint = getHitPoint(e),
                    prop: string,
                    ball: Ball;

                for (prop in this.collection.balls) {
                    ball = this.collection.balls[prop];
                    if (ball.isHit(hitPoint)) {
                        this.startPoint = hitPoint;
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
                         
                    this.currentBall.velocity = getVector(this.startPoint, this.currentPoint);
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
            this.collection.update();
            this.collection.draw();
            
            this.draw();

            if (this.running) {
                setTimeout(() => {
                    this.tick()
                }, 50);
            }
        }

        private draw() {
            if (this.startPoint && this.currentPoint) {
                this.context.beginPath();
                this.context.moveTo(this.startPoint.x, this.startPoint.y);
                this.context.lineTo(this.currentPoint.x, this.currentPoint.y);
                this.context.closePath();
                this.context.stroke();
            }
        }
    }

    class BallCollection {
        balls: Ball[];

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
        velocity: Vector = new Vector(0,0);
        
        constructor (public context, public location: Point, public size: number = 10, public colour: string = "#00000") { }

        draw() {
            if (this.touched)
                this.context.fillStyle = "#fffff";
            else
                this.context.fillStyle = this.colour;
            this.context.arc(this.location.x, this.location.y, this.size, 0, 360, false);
            this.context.fill();
        }

        update(steps: number = 1) {
            var i;

            this.touched = false;
            for (i = 0; i < steps; i++) {
                this.location.x += this.velocity.x;
                this.location.y += this.velocity.y;
                this.location.z += this.velocity.z;

                this.velocity.addFriction(0.1);
            }
        }

        isCrashed(otherBall: Ball): bool {
            var dist = this.location.getDist(otherBall.location);
            return dist <= 20;
        }

        isHit(hit: Point) : bool {
            var dist = this.location.getDist(hit);
            return dist <= this.size;
        }

        
    }

    class Point {
        constructor (public x: number, public y: number, public z: number = 0) { }

        getDist(other: Point) : number {
            var x = Math.abs(this.x - other.x);
            var y = Math.abs(this.y - other.y);
            var z = Math.abs(this.z - other.z);

            return Math.sqrt(x * x + y * y + z * z);
        }
    }

    function getVector(a: Point, b: Point): Vector {
        return new Vector(Math.abs(a.x - b.x), Math.abs(a.y - b.y), Math.abs(a.z - b.z));
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
    }
}
