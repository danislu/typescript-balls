var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
}
var Dsl;
(function (Dsl) {
    var friction = 0.95;
    var speed = 0.3;
    var Pool = (function () {
        function Pool(height, width, xOffset, yOffset, ctx, ballCount) {
            if (typeof ballCount === "undefined") { ballCount = 30; }
            this.height = height;
            this.width = width;
            this.xOffset = xOffset;
            this.yOffset = yOffset;
            this.ctx = ctx;
            var _this = this;
            this.running = false;
            var i;
            var ball;
            var balls = new Array();

            if(ballCount < 1) {
                ballCount = 1;
            }
            for(i = 0; i < ballCount; i++) {
                ball = new Ball(ctx, new Point(Math.random() * width, Math.random() * height, 0));
                balls.push(ball);
            }
            this.collection = new BallCollection(height, width);
            this.collection.balls = balls;
function getHitPoint(e) {
                return new Point(e.pageX - xOffset, e.pageY - yOffset);
            }
            window.onmousedown = function (e) {
                var hitPoint = getHitPoint(e);
                var prop;
                var ball;

                for(prop in _this.collection.balls) {
                    ball = _this.collection.balls[prop];
                    if(ball.isHit(hitPoint)) {
                        _this.startPoint = ball.location;
                        _this.currentBall = ball;
                        _this.currentBall.isActive = true;
                        break;
                    }
                }
            };
            window.onmousemove = function (e) {
                if(_this.currentBall) {
                    _this.currentPoint = getHitPoint(e);
                }
            };
            window.onmouseup = function (e) {
                if(_this.currentBall && _this.startPoint) {
                    _this.currentPoint = getHitPoint(e);
                    _this.currentBall.velocity.add(getVector(_this.startPoint, _this.currentPoint));
                    _this.currentBall.isActive = false;
                }
                _this.currentBall = null;
                _this.startPoint = null;
                _this.currentPoint = null;
            };
        }
        Pool.prototype.start = function () {
            this.running = true;
            this.tick();
        };
        Pool.prototype.stop = function () {
            this.running = false;
        };
        Pool.prototype.tick = function () {
            var _this = this;
            this.ctx.clearRect(0, 0, this.width, this.height);
            this.collection.update();
            this.collection.draw();
            this.draw();
            if(this.running) {
                setTimeout(function () {
                    _this.tick();
                });
            }
        };
        Pool.prototype.draw = function () {
            if(this.startPoint && this.currentPoint) {
                this.ctx.strokeStyle = "black";
                this.ctx.beginPath();
                this.ctx.moveTo(this.startPoint.x, this.startPoint.y);
                this.ctx.lineTo(this.currentPoint.x, this.currentPoint.y);
                this.ctx.closePath();
                this.ctx.stroke();
            }
        };
        return Pool;
    })();
    Dsl.Pool = Pool;    
    var BallCollection = (function () {
        function BallCollection(height, width) {
            this.height = height;
            this.width = width;
        }
        BallCollection.prototype.draw = function () {
            var ball;
            var prop;

            for(prop in this.balls) {
                ball = this.balls[prop];
                ball.draw();
            }
        };
        BallCollection.moveBallsBack = function moveBallsBack(a, b) {
            var dist = 21 - a.location.distanceTo(b.location);
            var aSpeed = a.velocity.getSize();
            var bSpeed = b.velocity.getSize();
            var totalSpeed = aSpeed + bSpeed;
            var oneP = totalSpeed / 100;
            var speedPart = (aSpeed / oneP) / 100;
            var otherSpeedPart = (bSpeed / oneP) / 100;
            if(otherSpeedPart < 0.01) {
                otherSpeedPart = 0;
                speedPart = 1;
            }
            if(speedPart < 0.01) {
                otherSpeedPart = 1;
                speedPart = 0;
            }
            BallCollection.moveBall(a, dist, speedPart);
            BallCollection.moveBall(b, dist, otherSpeedPart, false);
            return [
                speedPart, 
                otherSpeedPart
            ];
        }
        BallCollection.moveBall = function moveBall(ball, dist, p, up) {
            if (typeof up === "undefined") { up = true; }
            var oneDist = dist * p;
            var negV = ball.velocity.negativeClone();
            var negSize = negV.getSize();
            var rel = (negSize != 0) ? oneDist / negSize : 0;
            if(up) {
                rel *= -1;
            }
            ball.location.x += negV.x * rel;
            ball.location.y += negV.y * rel;
            ball.location.z += negV.z * rel;
        }
        BallCollection.prototype.update = function () {
            var touched;
            var a;
            var b;
            var prop;

            for(prop in this.balls) {
                a = this.balls[prop];
                a.update(this.height, this.width);
            }
            var pairs = this.getCollisions();
            for(prop in pairs) {
                var pair = pairs[prop];
                a = pair[0];
                b = pair[1];
                a.isTouching = b.isTouching = true;
                var p = BallCollection.moveBallsBack(a, b);
                var dx = a.location.x - b.location.x;
                var dy = a.location.y - b.location.y;
                a.velocity.x += (dx * 0.1);
                a.velocity.y += (dy * 0.1);
                b.velocity.x -= (dx * 0.1);
                b.velocity.y -= (dy * 0.1);
            }
        };
        BallCollection.prototype.getCollisions = function () {
            var pairs = [];
            var ball;
            var otherBall;
            var prop;

            for(prop in this.balls) {
                ball = this.balls[prop];
                for(prop in this.balls) {
                    otherBall = this.balls[prop];
                    if(otherBall === ball) {
                        continue;
                    }
                    if(ball.isCrashed(otherBall)) {
                        pairs.push([
                            ball, 
                            otherBall
                        ]);
                    }
                }
            }
            return pairs;
        };
        return BallCollection;
    })();    
    var Ball = (function () {
        function Ball(context, location, size, colour) {
            if (typeof size === "undefined") { size = 10; }
            if (typeof colour === "undefined") { colour = "white"; }
            this.context = context;
            this.location = location;
            this.size = size;
            this.colour = colour;
            this.velocity = new Vector(0, 0);
            this.no = Ball.ballCount++;
        }
        Ball.ballCount = 0;
        Ball.prototype.draw = function () {
            if(this.isActive) {
                this.context.fillStyle = "orange";
            } else {
                if(this.isTouching) {
                    this.context.fillStyle = "red";
                } else {
                    this.context.fillStyle = this.colour;
                }
            }
            this.context.beginPath();
            this.context.arc(this.location.x, this.location.y, this.size, 0, 360, false);
            this.context.closePath();
            this.context.fill();
            if(this.isActive) {
                this.context.strokeStyle = "black";
            } else {
                this.context.strokeStyle = "gray";
            }
            this.context.beginPath();
            this.context.arc(this.location.x, this.location.y, this.size, 0, Math.PI * 2, true);
            this.context.closePath();
            this.context.stroke();
            this.context.fillStyle = "black";
            this.context.font = "10px Georgia";
            var txt = this.no.toString();
            var width = this.context.measureText(txt).width;
            this.context.fillText(txt, this.location.x - width / 2, this.location.y + 3);
        };
        Ball.prototype.update = function (heigth, width, steps) {
            if (typeof steps === "undefined") { steps = 1; }
            var i;
            function getNewValue(loc, vel, wall) {
                var velocity = vel * speed;
                var newX = loc + velocity;
                if(newX > wall) {
                    return velocity;
                } else {
                    if(newX < 0) {
                        return wall + velocity;
                    }
                }
                return newX;
            }
            this.isTouching = false;
            for(i = 0; i < steps; i++) {
                this.velocity.addFriction(friction);
                this.location.x = getNewValue(this.location.x, this.velocity.x, width);
                this.location.y = getNewValue(this.location.y, this.velocity.y, heigth);
                this.location.z += this.velocity.z;
            }
        };
        Ball.prototype.toString = function () {
            return this.no.toString();
        };
        Ball.prototype.isCrashed = function (otherBall) {
            var dist = this.location.distanceTo(otherBall.location);
            return dist < 20;
        };
        Ball.prototype.isHit = function (hit) {
            var dist = this.location.distanceTo(hit);
            return dist <= this.size;
        };
        return Ball;
    })();    
    var Point = (function () {
        function Point(x, y, z) {
            if (typeof z === "undefined") { z = 0; }
            this.x = x;
            this.y = y;
            this.z = z;
        }
        Point.prototype.distanceTo = function (other) {
            var x = Math.abs(this.x - other.x);
            var y = Math.abs(this.y - other.y);
            var z = Math.abs(this.z - other.z);
            return Math.sqrt(x * x + y * y + z * z);
        };
        return Point;
    })();    
    function getVector(a, b) {
        return new Vector(a.x - b.x, a.y - b.y, a.z - b.z);
    }
    var Vector = (function (_super) {
        __extends(Vector, _super);
        function Vector(x, y, z) {
            if (typeof z === "undefined") { z = 0; }
                _super.call(this, x, y, z);
        }
        Vector.prototype.addFriction = function (friction) {
            this.x *= friction;
            this.y *= friction;
            this.z *= friction;
        };
        Vector.prototype.add = function (vector) {
            this.x += vector.x;
            this.y += vector.y;
            this.z += vector.z;
        };
        Vector.prototype.getSize = function () {
            return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
        };
        Vector.prototype.negativeClone = function () {
            return new Vector(this.x * -1, this.y * -1, this.z * -1);
        };
        return Vector;
    })(Point);    
})(Dsl || (Dsl = {}));

